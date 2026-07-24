import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export function startMockServer() {
  server.listen({ onUnhandledRequest: 'error' });
}

export function stopMockServer() {
  server.close();
}

export function resetMockServer() {
  server.resetHandlers();
}