import { getSupabase, supabaseMiddleware } from './middleware/auth.middleware';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api');
app.use('*', supabaseMiddleware());

const indexRoute = app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' });
});

app.get('/user', async (c) => {
  const supabase = getSupabase(c);
  const { data, error } = await supabase.auth.getUser();
  if (error) console.log('error', error);
  if (!data?.user) {
    return c.json({
      message: 'You are not logged in.',
    });
  }
  return c.json({
    message: 'You are logged in!',
    userId: data.user,
  });
});

app.get('/signout', async (c) => {
  const supabase = getSupabase(c);
  await supabase.auth.signOut();
  console.log('Signed out server-side!');
  return c.redirect('/');
});

export type AppType = typeof indexRoute;

export default handle(app);
