import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AZURE_OPENAI_ENDPOINT: z.string().url().optional(),
    AZURE_OPENAI_KEY: z.string().min(1).optional(),
    AZURE_OPENAI_DEPLOYMENT: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_MSAL_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_MSAL_AUTHORITY: z.string().url().default("https://login.microsoftonline.com/common"),
    NEXT_PUBLIC_MSAL_REDIRECT_URI: z.string().url().optional(),
    NEXT_PUBLIC_AI_ENABLED: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
    NEXT_PUBLIC_MSAL_CLIENT_ID: process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    NEXT_PUBLIC_MSAL_AUTHORITY: process.env.NEXT_PUBLIC_MSAL_AUTHORITY,
    NEXT_PUBLIC_MSAL_REDIRECT_URI: process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI,
    NEXT_PUBLIC_AI_ENABLED: process.env.NEXT_PUBLIC_AI_ENABLED,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
