import { auth } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { db } from '@/lib/drizzle';
import { workflows } from '@/lib/drizzle/schema';
import { Elysia, t } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
    .all("/auth/*", async ({ request, set }) => {
        const req = request as Request & { method: string };
        if (["POST", "GET"].includes(req.method)) {
          return auth.handler(req);
        }
        set.status = 405;
        return "Method Not Allowed";
    })
    .post('/createWorkflow', async ({ body }) => {
      const { title, template, usernames } = body;
      const slug = title.toLowerCase().replace(/ /g, '-');

      try {
        const [data] = await db.insert(workflows).values({ title, template, usernames, slug }).returning();
        
        return {
          message: "Workflow Creation Success",
          data
        }
      } catch (error) {
        return {
          message: `Workflow Creation Failed: ${error}`
        }
      }
    }, {
      body: t.Object({
        title: t.String(),
        template: t.String(),
        usernames: t.Array(t.String())
      })
    })
    .post('/beginWorkflow', async ({ body }) => {
      const { username, template, login } = body;
      const password = decrypt(login.encryptedPassword);

      console.log(`Username: ${username}, Password: ${password}`)

      return { success: true }
    },{
      body: t.Object({
        username: t.String(),
        template: t.String(),
        login: t.Object({
          username: t.String(),
          encryptedPassword: t.String()
        })
      })
    })

export const GET = app.fetch
export const POST = app.fetch