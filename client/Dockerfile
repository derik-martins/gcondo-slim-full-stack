FROM node:22.15.0-slim

WORKDIR /app

EXPOSE 5173

RUN corepack enable

CMD ["sh", "-c", "pnpm install && pnpm run dev"]