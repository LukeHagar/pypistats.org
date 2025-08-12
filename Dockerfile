FROM node:20-slim

# Install deps needed by Prisma and shell
RUN apt-get update && apt-get install -y openssl bash && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Allow skipping app build in devcontainer
ARG SKIP_APP_BUILD=0

# Copy package manifests first for better cache
COPY package.json pnpm-lock.yaml* ./

# Enable and use pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Generate Prisma client and build SvelteKit (Node adapter)
RUN pnpm prisma generate
RUN if [ "$SKIP_APP_BUILD" != "1" ]; then pnpm build; fi

ENV NODE_ENV=production

# Entrypoint handles migrations and start
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]


