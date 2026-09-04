import { Container } from "@mui/material";
import { FilterFromEnum } from "shared/components/Filter/enum";

import { EmptyBlock, Filter } from "shared/components";

import { HeaderWithFastProjectFilter, ProjectInfoBlock } from "./components";
import { useCheckLoading, useStatsWorkflowData } from "./hooks";

export const TasksPage = () => {
    const parallelHook = useStatsWorkflowData();
    const { isLoading, loadingWithError } = useCheckLoading(
        !parallelHook.projectsInformation.length
    );

    if (isLoading) {
        return (
            <EmptyBlock
                format="fullsize"
                text={
                    loadingWithError
                        ? "Ошибка загрузки данных. Попробуйте чуть позднее"
                        : "Ожидаем загрузки данных. Попробуйте чуть позднее"
                }
            />
        );
    }
    return (
        <Container
            sx={{
                bgcolor: "background.default",
                color: "text.primary",
                height: "100vh",
            }}
            maxWidth={false}
            disableGutters
        >
            <Filter from={FilterFromEnum.statsWorkflow} />
            <HeaderWithFastProjectFilter
                projectsInformation={parallelHook.projectsInformation}
                allFilterStats={parallelHook.allFilterStats}
            />
            <ProjectInfoBlock {...parallelHook} />
        </Container>
    );
};
