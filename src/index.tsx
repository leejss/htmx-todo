import { html } from "@elysiajs/html";
import { Elysia, t } from "elysia";
import type { Children } from "@kitajs/html";
import { staticPlugin } from "@elysiajs/static";
import { Todo, todos } from "./db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .get("/", () => {
    return (
      <BaseHTML>
        <div hx-get="/todos" hx-trigger="load" hx-swap="innerHTML"></div>
      </BaseHTML>
    );
  })
  .get("/todos", async () => {
    const data = await db.select().from(todos).all();
    return (
      <BaseHTML>
        <div class="grid gap-3">
          <ul data-id="list" class="flex flex-col gap-2">
            {data.map((todo) => {
              return <TodoItem {...todo} />;
            })}
          </ul>
          <TodoForm />
        </div>
      </BaseHTML>
    );
  })
  .put(
    "/todos/:id",
    async ({ params }) => {
      const oldTodo = await db.select().from(todos).where(eq(todos.id, params.id)).get();
      if (oldTodo) {
        const newTodo = await db.update(todos).set({ completed: !oldTodo.completed }).where(eq(todos.id, params.id)).returning().get();
        return <TodoItem {...newTodo} />;
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .delete(
    "/todos/:id",
    async ({ params }) => {
      await db.delete(todos).where(eq(todos.id, params.id));
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .post(
    "/todos",
    async ({ body }) => {
      if (body.content.length === 0) {
        throw new Error("Content cannot be empty");
      }
      const todo = await db.insert(todos).values(body).returning().get();
      return <TodoItem {...todo} />;
    },
    {
      body: t.Object({
        content: t.String(),
      }),
    },
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

const BaseHTML = ({ children }: { children: Children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.6"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.7"></script>
        <link href="/public/index.css" rel="stylesheet" type="text/css"></link>
        <title>HTMX Todo</title>
      </head>
      <body>
        <div class="flex h-screen justify-center items-center">{children}</div>
      </body>
    </html>
  );
};

function TodoItem({ completed, content, id }: Todo) {
  return (
    <div class="flex flex-row gap-4 items-center">
      <input hx-put={`/todos/${id}`} hx-target="closest div" hx-swap="outerHTML" type="checkbox" checked={completed} />
      <span>{content}</span>
      <button class="bg-red-500 py-1 px-2 text-white rounded-md" hx-delete={`/todos/${id}`} hx-target="closest div" hx-swap="outerHTML">
        Delete
      </button>
    </div>
  );
}

function TodoForm() {
  return (
    <form _="on submit target.reset()" class="grid" hx-post="/todos" hx-target="[data-id=list]" hx-swap="beforeend">
      <input class="border border-black" type="text" name="content" />
      <button class="bg-black text-white p-2" type="submit">
        Submit
      </button>
    </form>
  );
}
