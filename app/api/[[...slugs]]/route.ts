import { auth } from '@/lib/auth';
import { Elysia, t } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
    .get('/', 'Hello Nextjs')
    .all("/auth/*", async ({ request, set }) => {
        const req = request as Request & { method: string };
        if (["POST", "GET"].includes(req.method)) {
          return auth.handler(req);
        }
        set.status = 405;
        return "Method Not Allowed";
    })

export const GET = app.fetch
export const POST = app.fetch