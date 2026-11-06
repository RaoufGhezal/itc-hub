# itc blida

## about

itc blida is a club website for browsing events, registering, and chatting with an ai assistant.

## stack

- next.js, react, and typescript
- nestjs
- postgresql and redis
- tailwind css

## run locally

you need node.js and docker installed.

start postgresql and redis from the project root:

```sh
docker compose up -d
```

configure the backend by copying `server/.env.example` to `server/.env`. set the database and redis urls, and add a jwt secret. chat also needs a groq api key.

install dependencies and start the backend in one terminal:

```sh
cd server
npm i
npm run dev
```

start the frontend in another terminal:

```sh
cd client
npm i
npm run dev
```

open [http://localhost:3000](http://localhost:3000).

## api routes

all routes use the `/api` prefix.

| method | route                       | access    |
| ------ | --------------------------- | --------- |
| post   | `/api/auth/register`        | public    |
| post   | `/api/auth/login`           | public    |
| post   | `/api/auth/logout`          | signed in |
| post   | `/api/auth/refresh`         | public    |
| get    | `/api/users/me`             | signed in |
| get    | `/api/events`               | public    |
| get    | `/api/events?upcoming=true` | public    |
| get    | `/api/events/:id`           | public    |
| post   | `/api/events`               | admin     |
| post   | `/api/events/:id/register`  | member    |
| get    | `/api/chat/history`         | signed in |
| post   | `/api/chat`                 | signed in |
