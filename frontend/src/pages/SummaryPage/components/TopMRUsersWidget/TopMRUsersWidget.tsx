import React, { useEffect, useMemo, useState } from "react";

import { useGitlabData } from "../../../../contexts/data";
import { usersPageStorage } from "shared/services";
import type { UserPageState } from "shared/models";
import { DashboardListWidget } from "../common/DashboardListWidget/DashboardListWidget";

export const TopMRUsersWidget: React.FC = () => {
    const { gitlabData } = useGitlabData();

    const [userNames, setUserNames] = useState<UserPageState["userNames"]>({});

    useEffect(() => {
        let isMounted = true;
        usersPageStorage
            .load()
            .then((state) => {
                if (isMounted) {
                    setUserNames(state.userNames);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setUserNames({});
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const { allUsers, totalMRs, totalUsers } = useMemo(() => {
        // Группируем MR по пользователям (только opened)
        const mrsByUser = new Map<string, { email: string; mrs: number }>();

        gitlabData.forEach((info) => {
            const userEmail = info.email;
            const totalUserMRs = info.openedDates?.length || 0;

            if (totalUserMRs > 0) {
                const existing = mrsByUser.get(userEmail);
                if (existing) {
                    existing.mrs += totalUserMRs;
                } else {
                    mrsByUser.set(userEmail, { email: userEmail, mrs: totalUserMRs });
                }
            }
        });

        const totalUsersCount = mrsByUser.size;

        const usersArray = Array.from(mrsByUser.values()).sort((a, b) => b.mrs - a.mrs);

        const max = usersArray.length > 0 ? Math.max(...usersArray.map((u) => u.mrs)) : 1;

        const total = usersArray.reduce((sum, user) => sum + user.mrs, 0);

        const allUsersData = usersArray.map((user) => ({
            ...user,
            percentage: (user.mrs / max) * 100,
        }));

        return {
            allUsers: allUsersData,
            totalMRs: total,
            totalUsers: totalUsersCount,
        };
    }, [gitlabData]);

    const getUserDisplayName = (email: string) => {
        return userNames[email] || email;
    };

    const displayItems = allUsers.map((user) => ({
        id: user.email,
        label: getUserDisplayName(user.email),
        value: user.mrs,
        percentage: user.percentage,
        tooltip: `${getUserDisplayName(user.email)}: ${user.mrs} ${
            user.mrs === 1 ? "merge request" : "merge requests"
        }`,
    }));

    return (
        <DashboardListWidget
            title="MERGE REQUESTS: TOP OPENERS"
            stats={[
                {
                    value: totalMRs,
                    label: "Opened MRs",
                },
                {
                    value: totalUsers,
                    label: "Openers",
                },
            ]}
            items={displayItems}
            barColor="#8b5cf6"
            emptyState="Нет данных о merge requests"
            maxVisible={5}
        />
    );
};
