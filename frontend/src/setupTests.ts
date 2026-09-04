import { server } from './mocks/server';

// Настраиваем MSW для всех тестов
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
