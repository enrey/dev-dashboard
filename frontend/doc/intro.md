# Техническое описание проекта Dashboard UI

## Общее описание

Dashboard UI - это современное веб-приложение на основе React с использованием TypeScript, разработанное для предоставления информационной панели и управления различными сервисами. Проект использует Material UI для UI-компонентов и Vite для быстрой сборки.

## Архитектура проекта

```
src/
├── assets/           # Статические ресурсы
├── contexts/         # React Context для глобального состояния
├── environments/     # Конфигурации окружений
├── icons/            # Компоненты иконок
├── lib/              # Утилиты и вспомогательные библиотеки
├── mocks/            # Моки для тестирования
├── pages/            # Компоненты страниц
├── routing/          # Конфигурация маршрутизации
├── shared/           # Общие компоненты и хуки
├── App.tsx          # Главный компонент приложения
└── index.tsx        # Точка входа в приложение
```

## Технологии и инструменты

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **Styling**: SCSS + Emotion
- **State Management**: React Query + React Context
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier
- **API Client**: Axios

## Структура приложения

### 1. Маршрутизация

```tsx
// src/routing/AppRouter.tsx (пример структуры)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### 2. Управление состоянием

Проект использует комбинацию React Context и React Query:

```tsx
// Пример использования React Query для получения данных
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface DashboardData {
  services: Service[];
  metrics: Metric[];
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get('/api/dashboard');
  return response.data;
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });
};
```

### 3. Стилизация

Проект использует Material UI с Emotion для стилизации компонентов:

```tsx
// Пример компонента со стилями
import { styled } from '@emotion/styled';
import { Card, CardContent } from '@mui/material';

const StyledCard = styled(Card)`
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const DashboardCard = () => {
  return (
    <StyledCard>
      <CardContent>
        {/* Содержимое карточки */}
      </CardContent>
    </StyledCard>
  );
};
```

## Основные файлы и их назначение

| Файл | Назначение |
|------|------------|
| `src/App.tsx` | Главный компонент приложения |
| `src/index.tsx` | Точка входа в приложение |
| `vite.config.ts` | Конфигурация сборки |
| `package.json` | Зависимости и скрипты |
| `tsconfig.json` | Конфигурация TypeScript |
| `Dockerfile` | Конфигурация для контейнеризации |

## Запуск проекта

### Локальная разработка

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка проекта
pnpm build

# Проверка кода
pnpm lint:fix

# Запуск тестов
pnpm test
```

### Структура команд в package.json

```json
{
  "scripts": {
    "dev": "vite",                    // Запуск в режиме разработки
    "build": "tsc && vite build",     // Сборка проекта
    "preview": "vite preview",        // Просмотр собранного проекта
    "test": "vitest run",             // Запуск тестов
    "test:watch": "vitest",           // Запуск тестов в watch-режиме
    "lint:fix": "eslint --fix --ext=.tsx,.ts src"  // Исправление ошибок линтера
  }
}
```

## Архитектурные паттерны

### 1. Компонентный подход

Компоненты организованы по принципу разделения ответственности:

```tsx
// src/shared/components/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <CircularProgress />
);

// src/pages/DashboardPage.tsx
export const DashboardPage = () => {
  const { data, isLoading } = useDashboardData();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Рендеринг данных */}
    </div>
  );
};
```

### 2. Хуки

Общие хуки вынесены в `src/lib/`:

```tsx
// src/lib/hooks/useLocalStorage.ts
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  // Реализация хука
};
```

### 3. Контексты

Контексты для глобального состояния:

```tsx
// src/contexts/ThemeContext.tsx
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Тестирование

Проект использует Vitest для unit-тестирования:

```tsx
// Пример теста
import { render, screen } from '@testing-library/react';
import { DashboardCard } from './DashboardCard';

describe('DashboardCard', () => {
  it('renders correctly', () => {
    render(<DashboardCard />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
```

## Стилизация и темизация

Проект использует MUI с возможностью темизации:

```tsx
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## API и работа с данными

Для работы с API используется Axios и React Query:

```tsx
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };
```

## Деплоймент

Проект может быть собран в Docker-контейнер:

```dockerfile
FROM node:20.15-alpine as builder
WORKDIR '/app'
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
```

## Полезные ресурсы

- [Официальная документация React](https://reactjs.org/docs/getting-started.html)
- [Документация TypeScript](https://www.typescriptlang.org/docs/)
- [Material UI](https://mui.com/material-ui/)
- [React Query](https://tanstack.com/query/v5/docs/react/overview)
- [Vite](https://vitejs.dev/guide/)

## Стандарты кодирования

- Используется Prettier для форматирования кода
- Все компоненты должны быть типизированы
- Используются функциональные компоненты с хуками
- Компоненты должны быть переиспользуемыми и модульными
- Файлы именуются в PascalCase для компонентов и camelCase для остальных файлов
