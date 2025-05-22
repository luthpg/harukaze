import { env as runtimeEnv } from '../utils/env';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { setCookie } from 'hono/cookie';

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient;
  }
}

export const getSupabase = (c: Context) => {
  return c.get('supabase');
};

type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const supabaseEnv = env<SupabaseEnv>(c);
    const supabaseUrl = supabaseEnv.SUPABASE_URL ?? runtimeEnv.SUPABASE_URL;
    const supabaseAnonKey =
      supabaseEnv.SUPABASE_ANON_KEY ?? runtimeEnv.SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL missing!');
    }

    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY missing!');
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          const cookieHeaders = parseCookieHeader(c.req.header('Cookie') ?? '');
          return cookieHeaders.map((cookieHeader) => ({
            ...cookieHeader,
            value: cookieHeader.value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(c, name, value, {
              ...options,
              sameSite: 'Strict',
              priority: options.priority === 'high' ? 'High' : options.priority === 'medium' ? 'Medium' : 'Low',
            });
          }
        },
      },
    });

    c.set('supabase', supabase);

    await next();
  };
};
