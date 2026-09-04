import { FC, memo } from "react";

import LinkIcon from "@mui/icons-material/Link";
import { Box, Link, TableCell, Tooltip } from "@mui/material";
import { useLocation } from "react-router-dom";
import { MuiRouterLink } from "shared/components/MuiRouterLink";

import { UserRowProps } from "./models";
import tableStyles from "./UsersTable.module.scss";

// ОПТИМИЗАЦИЯ: Мемоизация компонента для предотвращения лишних ререндеров
const UserRowComponent: FC<UserRowProps> = ({
    isMatched,
    email,
    name,
    totalProjects,
    selectedDate,
    userNames,
    linkedEmails,
}) => {
    const locationParams = useLocation();

    // Получаем имя из userNames или используем имя по умолчанию
    const displayName = userNames[email] || name;

    // Проверяем, есть ли связанные email
    const linked = linkedEmails[email] || [];
    const hasLinkedEmails = linked.length > 0;

    return (
        <TableCell
            key="user"
            className={tableStyles.userCell}
            sx={{ padding: "4px 6px" }}
        >
            <Box className={tableStyles.userCellContent}>
                <Box className={tableStyles.userName}>
                    <Link
                        className={tableStyles.userNameLink}
                        sx={{
                            opacity: isMatched ? "1" : "0.6",
                            color: "rgb(0, 151, 167)",
                        }}
                        underline="none"
                        to={{
                            pathname: `/worklog/${email}`,
                            search: selectedDate
                                ? `?selectedDate=${selectedDate.toISOString().split("T")[0]}&from=actions`
                                : `${locationParams.search}&from=actions`,
                        }}
                        state={{ backgroundLocation: locationParams }}
                        component={MuiRouterLink}
                    >
                        {displayName}
                    </Link>
                    {hasLinkedEmails && (
                        <Tooltip title={`Объединены данные: ${linked.join(", ")}`} arrow>
                            <LinkIcon
                                sx={{
                                    fontSize: 14,
                                    color: "primary.main",
                                    opacity: 0.7,
                                }}
                            />
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </TableCell>
    );
};

// ОПТИМИЗАЦИЯ: Кастомный компаратор для точного контроля перерисовок
const arePropsEqual = (prevProps: UserRowProps, nextProps: UserRowProps) => {
    // Сравниваем основные поля
    if (
        prevProps.email !== nextProps.email ||
        prevProps.name !== nextProps.name ||
        prevProps.isMatched !== nextProps.isMatched ||
        prevProps.totalProjects !== nextProps.totalProjects
    ) {
        return false;
    }

    // Сравниваем selectedDate
    if (prevProps.selectedDate?.getTime() !== nextProps.selectedDate?.getTime()) {
        return false;
    }

    // Проверяем стабильность ссылок на объекты (они из useMemo)
    if (
        prevProps.userNames !== nextProps.userNames ||
        prevProps.userRoles !== nextProps.userRoles ||
        prevProps.linkedEmails !== nextProps.linkedEmails
    ) {
        return false;
    }

    return true;
};

// Экспортируем мемоизированный компонент с кастомным компаратором
export const UserRow = memo(UserRowComponent, arePropsEqual);
