import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

/** @see https://trpc.io/docs/server/context */
export async function createTRPCContext(opts: { headers: Headers }) {
  return {
    db,
    ...opts,
  };
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/** @see https://trpc.io/docs/server/server-side-calls */
export const createCallerFactory = t.createCallerFactory;

/** @see https://trpc.io/docs/router */
export const createTRPCRouter = t.router;

/** Adds timing logs and an artificial delay in dev to catch unwanted waterfalls. */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  console.log(`[TRPC] ${path} took ${Date.now() - start}ms to execute`);

  return result;
});

/** Public (unauthenticated) procedure. */
export const publicProcedure = t.procedure.use(timingMiddleware);
