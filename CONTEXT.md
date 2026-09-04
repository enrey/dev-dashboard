# Микроменеджер Dashboard

Дашборд для анализа цифровых следов сотрудников — агрегирует активность из Git, GitLab, Jira, Confluence и календаря присутствия в единую аналитическую картину.

## People

**Contributor**:
Человек, идентифицируемый по email, чья активность отслеживается в любом из источников.
_Avoid_: User, Employee, Developer, Person, Author

**Linked Emails**:
Группа email-адресов, принадлежащих одному Contributor. Используется, когда один человек оставляет цифровые следы под разными адресами.
_Avoid_: Aliases, secondary emails

**Role**:
Пользовательская категория (имя + цвет), назначаемая Contributor на странице Users. Не связана с правами доступа.
_Avoid_: Group, Team, Permission

## Source Systems

**DataSource**:
Внешняя система, из которой приходит цифровой след Contributor: Git, GitLab, Jira, Confluence или календарь присутствия.
_Avoid_: Integration, Service

## Git Artifacts

**Commit**:
Единичное сохранение изменений в Git-репозитории.
_Avoid_: Contribution, Change

**Repository**:
Git-проект, из которого извлекаются коммиты.
_Avoid_: Project

**Head Commit**:
Последний известный коммит репозитория на момент синхронизации.
_Avoid_: Latest Commit

**Churn**:
Метрика объёма изменений: `added + deleted` строк в коммите, MR или Confluence-странице.

## GitLab Artifacts

**Merge Request (MR)**:
Запрос на слияние ветки в GitLab.
_Avoid_: Pull Request, PR

**Merge Request Comment**:
Комментарий, оставленный к Merge Request.
_Avoid_: Review Comment

## Jira Artifacts

**Issue (Task)**:
Единица работы в Jira.
_Avoid_: Ticket, Card

**Issue Type**:
Классификация Issue по виду работы: ошибка, улучшение, новая функциональность, epic, defect, подзадача или неопознанный тип.
_Avoid_: TaskType, WorkItemType

**Task Status**:
Этап жизненного цикла Issue в процессе разработки.
_Avoid_: State, Phase, Stage

**Task Change**:
Запись об изменении Issue: переход статуса или изменение описания.
_Avoid_: Event, History Item

**Assignee**:
Contributor, назначенный исполнителем Issue.
_Avoid_: Owner

## Confluence Artifacts

**Page Change**:
Изменение страницы или вложения в Confluence.
_Avoid_: Documentation Update, Wiki Edit

## Calendar

**Presence**:
Дневная запись о статусе присутствия Contributor из корпоративного календаря.
_Avoid_: Attendance, Availability

**Presence Type**:
Тип дня в календаре присутствия: стандартный день, особый день, отсутствие, отпуск или болезнь.
_Avoid_: Attendance Type

## Analytics Aggregates

**Combined Task**:
Аналитическая сущность, объединяющая Issue и связанные с ней Commit.
_Avoid_: Hybrid Task

**Combined Task with MR**:
Combined Task, дополненная связанными Merge Request.

**Extended Combined Task**:
Combined Task with MR, дополненная Merge Request Comment.

**Person Statistics**:
Агрегат активности одного Contributor по всем доступным DataSource.
_Avoid_: UserStats, DeveloperMetrics

**Git Statistics**:
Статистика Commit одного Contributor в разрезе репозитория и дня.

**Unknown Commit**:
Commit, который не удалось связать ни с одним Issue.
_Avoid_: Unmatched Task

## Operations

**Sync Job**:
Фоновое задание, которое загружает данные из одного DataSource.

**Source Load Status**:
Состояние загрузки данных одного DataSource в пользовательском интерфейсе.
