FROM node:20.19-alpine AS builder
WORKDIR '/app'
ARG VITE_SHOW_DATE
ARG VITE_DISABLE_PRESENCE=false
ARG VITE_DISABLE_JIRA_USERS=false
ARG VITE_DISABLE_GITLAB_USERS=false
ENV VITE_SHOW_DATE=${VITE_SHOW_DATE}
ENV VITE_DISABLE_PRESENCE=${VITE_DISABLE_PRESENCE}
ENV VITE_DISABLE_JIRA_USERS=${VITE_DISABLE_JIRA_USERS}
ENV VITE_DISABLE_GITLAB_USERS=${VITE_DISABLE_GITLAB_USERS}
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

FROM nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
