import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@vibecast/api/src/router';

export const trpc = createTRPCReact<AppRouter>();
