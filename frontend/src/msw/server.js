import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This server is used by Vitest (Node environment)
export const server = setupServer(...handlers);

// Start server before all tests, reset handlers between each test,
// and stop server after all tests are done.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
