import { FC, memo } from "react";

import LinkIcon from "@mui/icons-material/Link";
import { Box, Button, ButtonGroup, Link, Typography, Tooltip } from "@mui/material";

import { UserInfoBlockProps } from "./models";

export const UserInfoBlock: FC<UserInfoBlockProps> = memo(
    ({ name, email, gitUrl, jiraUrl, linkedEmails = [] }) => {
        const hasLinkedEmails = linkedEmails.length > 0;
        
        return (
            <>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h4">{name}</Typography>
                            {hasLinkedEmails && (
                                <Tooltip 
                                    title={`Объединены данные: ${linkedEmails.join(", ")}`}
                                    arrow
                                >
                                    <LinkIcon 
                                        sx={{ 
                                            fontSize: 20, 
                                            color: "primary.main",
                                            opacity: 0.7,
                                        }} 
                                    />
                                </Tooltip>
                            )}
                        </Box>
                        <Typography variant="subtitle1">{email}</Typography>
                    </Box>
                </Box>
                <ButtonGroup variant="text" aria-label="text button group">
                    <Button disabled={!gitUrl}>
                        <Link
                            href={gitUrl}
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitLab
                        </Link>
                    </Button>
                    <Button disabled={!jiraUrl}>
                        <Link
                            href={jiraUrl}
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Jira
                        </Link>
                    </Button>
                </ButtonGroup>
            </>
        );
    }
);
