import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  // You can add user authentication here later
  const user = { isAuthed: false };

  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
