/**
 * MSW Server для использования в тестах
 */
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// Создаем тестовый сервер с обработчиками
export const server = setupServer(...handlers);



