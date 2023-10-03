import { html } from "@elysiajs/html";
import { Elysia, t } from "elysia";
import type { Children } from "@kitajs/html";
import { staticPlugin } from "@elysiajs/static";

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
  .get("/todos", () => {
    return (
      <BaseHTML>
        <div class="grid gap-3">
          <ul data-id="list" class="flex flex-col gap-2">
            {db.map((todo) => {
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
    ({ params }) => {
      const id = params.id;
      const todo = db.find((todo) => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        return <TodoItem {...todo} />;
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
    ({ params }) => {
      const { id } = params;
      const todo = db.find((todo) => todo.id === id);
      if (todo) {
        db.splice(db.indexOf(todo), 1);
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
  )
  .post(
    "/todos",
    ({ body }) => {
      if (body.content.length === 0) {
        throw new Error("Content cannot be empty");
      }
      const todo = {
        id: db.length + 1,
        content: body.content,
        completed: false,
      };
      db.push(todo);
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
        <link href="/public/index.css" rel="stylesheet" type="text/css"></link>
        <title>HTMX Todo</title>
      </head>
      <body>
        <div class="flex h-screen justify-center items-center">{children}</div>
      </body>
    </html>
  );
};

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

const db: Todo[] = [
  {
    id: 1,
    content: "Hello",
    completed: false,
  },
  {
    id: 2,
    content: "World",
    completed: false,
  },
];

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
    <form class="grid" hx-post="/todos" hx-target="[data-id=list]" hx-swap="beforeend">
      <input class="border border-black" type="text" name="content" />
      <button class="bg-black text-white p-2" type="submit">
        Submit
      </button>
    </form>
  );
}
