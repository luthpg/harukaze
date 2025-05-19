import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SUPABASE_URL: z.string().url().min(1),
    SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
