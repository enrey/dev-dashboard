# MSW Моки для тестов

Этот каталог содержит настройку Mock Service Worker (MSW) для мокирования API запросов в тестах.

## Структура

- `handlers.ts` - обработчики HTTP запросов для различных API endpoints
- `server.ts` - настройка MSW сервера для Node.js окружения (тесты)
- `index.ts` - экспорт для удобного использования

## Использование

MSW автоматически активируется для всех тестов через `setupTests.ts`. Вам не нужно дополнительно настраивать его в каждом тесте.

### Базовое использование

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDataContext } from '../useDataContext';

// MSW автоматически перехватывает все HTTP запросы
test('должен загружать данные', async () => {
  const { result } = renderHook(() => useDataContext(initialData), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.gitAnalyzerInfo).toBeDefined();
  });
});
```

### Переопределение handlers для конкретного теста

```typescript
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

test('должен обрабатывать пустые данные', async () => {
  // Переопределяем handler только для этого теста
  server.use(
    http.get('*/api/Git/commits', () => {
      return HttpResponse.json([]);
    })
  );

  // Тест с пустыми данными...
});
```

## API Endpoints

Все моки настроены для следующих endpoints:

- **Git Analyzer API** (`http://localhost:5002/api`)
  - `GET /Git/commits` - получение коммитов
  - `GET /Git/tasks` - получение задач из Git

- **Jira API** (`http://localhost:5001/api`)
  - `GET /Jira/tasks` - получение задач Jira
  - `GET /Jira/users` - получение пользователей Jira

- **GitLab API** (`http://localhost:5003/api`)
  - `GET /GitLab/merge-requests` - получение merge requests
  - `GET /GitLab/gitlabUsers` - получение пользователей GitLab
  - `GET /GitLab/comments` - получение комментариев
  - `GET /GitLab/tasks/:dateStart/:dateEnd` - получение статистики по задачам

- **Calendar API** (`http://localhost:5010`)
  - `GET /api_v2/integration/presence` - получение данных о присутствии
  - `GET /api_v2/integration/users` - получение пользователей календаря

- **Confluence API** (`http://localhost:5006/api`)
  - `GET /Confluence/articles` - получение статей Confluence

## Моковые данные

Вы можете использовать готовые моковые данные из `handlers.ts`:

```typescript
import { mockGitAnalyzerInfo, mockTasksData, mockJiraUsers } from '../../../mocks/handlers';

// Использование в тестах
expect(result.current.gitAnalyzerInfo).toEqual(mockGitAnalyzerInfo);
```

## Добавление новых handlers

Чтобы добавить новый handler:

1. Откройте `handlers.ts`
2. Добавьте новый обработчик в массив `handlers`:

```typescript
export const handlers = [
  // ... существующие handlers
  
  // Новый handler
  http.get('http://your-api.com/endpoint', () => {
    return HttpResponse.json({ data: 'mock data' });
  }),
];
```

3. Добавьте моковые данные, если нужно:

```typescript
export const mockNewData = [
  // ваши моковые данные
];
```

## Отладка

Если MSW не перехватывает запросы:

1. Проверьте, что URL в handler точно соответствует URL в API сервисе
2. Убедитесь, что MSW сервер запущен (это делается автоматически в `setupTests.ts`)
3. Используйте `onUnhandledRequest: 'warn'` в `setupTests.ts` для предупреждений о необработанных запросах

## Полезные ссылки

- [MSW документация](https://mswjs.io/)
- [MSW с React Query](https://mswjs.io/docs/recipes/query-client)
- [Testing Library](https://testing-library.com/)



