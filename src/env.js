import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_MSAL_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_MSAL_AUTHORITY: z.string().url().default("https://login.microsoftonline.com/common"),
    NEXT_PUBLIC_MSAL_REDIRECT_URI: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
    NEXT_PUBLIC_AZURE_OPENAI_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT: z.string().min(1).optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_MSAL_CLIENT_ID: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    NEXT_PUBLIC_MSAL_AUTHORITY: process.env.NEXT_PUBLIC_MSAL_AUTHORITY,
    NEXT_PUBLIC_MSAL_REDIRECT_URI: process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI,
    NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
    NEXT_PUBLIC_AZURE_OPENAI_KEY: process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY,
    NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
