import { hc } from 'hono/client';
import type { AppType } from '~/harukaze-api/api';

export const honoClient = hc<AppType>('/');
