import { FC, useContext, useEffect, useState, useMemo, useTransition } from "react";

import { Box, Container } from "@mui/material";
import { parseISO, parse } from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";

import { UserInfoBlock } from "./components/UserInfoBlock";
import { UserStats } from "./components/UserStats";
import { UserStatsTimeLine } from "./components/UserStatsTimeLine";
import { useAggregatedData } from "../../contexts/data";
import { FilterContext } from "../../contexts/filter";
import { FilterData } from "../../shared/components";
import { usersPageStorage } from "shared/services";
import type { UserPageState } from "shared/models";

interface WorklogPageProps {
    variant?: "page" | "modal";
}

export const WorklogPage: FC<WorklogPageProps> = ({ variant = "page" }) => {
    const { mail } = useParams();
    const [searchParams] = useSearchParams();
    const selectedDate = searchParams.get('selectedDate');
    const { filter: globalFilter } = useContext(FilterContext);
    const { dataSource } = useAggregatedData();
    const [blinkingDateId, setBlinkingDateId] = useState<string | null>(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [linkedEmails, setLinkedEmails] = useState<UserPageState["linkedEmails"]>({});
    const [userNames, setUserNames] = useState<UserPageState["userNames"]>({});

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setLinkedEmails(state.linkedEmails);
                    setUserNames(state.userNames);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setLinkedEmails({});
                    setUserNames({});
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Локальное состояние фильтра для WorklogPage - мемоизируем инициализацию
    const localFilter = useMemo<FilterData>(() => {
        const dateStartParam = searchParams.get('dateStart');
        const dateEndParam = searchParams.get('dateEnd');
        const usersParam = searchParams.get('users');

        if (dateStartParam || dateEndParam || usersParam) {
            const newFilter = { ...globalFilter };

            if (dateStartParam) {
                newFilter.dateStart = parse(dateStartParam, 'MM-dd-yyyy', new Date());
            }
            if (dateEndParam) {
                newFilter.dateEnd = parse(dateEndParam, 'MM-dd-yyyy', new Date());
            }
            if (usersParam) {
                const usersArray = usersParam.split(',').map(email => ({ email }));
                newFilter.users = usersArray;
            }

            return newFilter;
        }

        return globalFilter;
    }, [searchParams.get('dateStart'), searchParams.get('dateEnd'), searchParams.get('users'), globalFilter]);

    // Оптимизированная фильтрация данных с мемоизацией - получаем только нужного пользователя
    const userData = useMemo(() => {
        if (!mail) return undefined;
        
        // Сначала пытаемся найти пользователя напрямую
        let user = dataSource.find(({ user }) => user.email === mail);
        
        // Если не найден, проверяем связанные email
        if (!user) {
            // Ищем основной email, к которому привязан запрашиваемый
            const parentEmail = Object.keys(linkedEmails).find((parentEmail) =>
                linkedEmails[parentEmail].some((linkedEmail) => linkedEmail.toLowerCase() === mail?.toLowerCase())
            );
            
            // Если нашли родительский email, ищем пользователя по нему
            if (parentEmail) {
                user = dataSource.find(({ user }) => user.email.toLowerCase() === parentEmail.toLowerCase());
            }
        }
        
        return user;
    }, [mail, dataSource, linkedEmails]);

    // Показываем timeline с задержкой для быстрого открытия попапа
    useEffect(() => {
        if (userData) {
            // Используем startTransition для отложенного рендеринга timeline
            startTransition(() => {
                setShowTimeline(true);
            });
        }
    }, [userData]);

    // Автоматический скролл к дате при открытии popup и установка мигающей рамки
    useEffect(() => {
        if (selectedDate && userData) {
            const targetDate = parseISO(selectedDate);
            const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
            const elementId = `timeline-${dateString}`;

            // Устанавливаем мигающий элемент сразу
            setBlinkingDateId(elementId);

            // Уменьшаем задержку скролла для более быстрой реакции
            const scrollTimeoutId = setTimeout(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            // Сбрасываем мигающую рамку через 3 секунды
            const blinkTimeoutId = setTimeout(() => {
                setBlinkingDateId(null);
            }, 3000);

            return () => {
                clearTimeout(scrollTimeoutId);
                clearTimeout(blinkTimeoutId);
            };
        }
    }, [selectedDate, userData]);

    return (
        <Container
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                height: variant === "modal" ? "80vh" : "100vh",
                overflow: "auto",
            }}
            maxWidth={variant === "modal" ? "xl" : false}
            disableGutters
        >
            <Box sx={{ p: 2 }}>
                {userData && (() => {
                    const displayName = userNames[userData.user?.email] || userData.user?.name || "";
                    const linkedEmailsList = linkedEmails[userData.user?.email] || [];
                    
                    return (
                        <>
                            <UserInfoBlock
                                name={displayName}
                                email={userData.user?.email || ""}
                                jiraUrl={userData?.jiraUrl}
                                gitUrl={userData?.gitUrl}
                                linkedEmails={linkedEmailsList}
                            />
                            <UserStats userData={userData} />
                            {showTimeline && (
                                <UserStatsTimeLine userData={userData} blinkingDateId={blinkingDateId} />
                            )}
                        </>
                    );
                })()}
            </Box>
        </Container>
    );
};
