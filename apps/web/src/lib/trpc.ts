import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@researchhive/api/src/router';

export const trpc = createTRPCReact<AppRouter>();
