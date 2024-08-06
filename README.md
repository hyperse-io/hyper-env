# @hyperse/hyper-env

<p align="left">
  <a aria-label="Build" href="https://github.com/hyperse-io/hyper-env/actions?query=workflow%3ACI">
    <img alt="build" src="https://img.shields.io/github/actions/workflow/status/hyperse-io/hyper-env/ci-integrity.yml?branch=main&label=ci&logo=github&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="stable version" href="https://www.npmjs.com/package/@hyperse/hyper-env">
    <img alt="stable version" src="https://img.shields.io/npm/v/%40hyperse%2Fhyper-env?branch=main&label=version&logo=npm&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="Top language" href="https://github.com/hyperse-io/hyper-env/search?l=typescript">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/hyperse-io/hyper-env?style=flat-square&labelColor=000&color=blue">
  </a>
  <a aria-label="Licence" href="https://github.com/hyperse-io/hyper-env/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/hyperse-io/hyper-env?style=flat-quare&labelColor=000000" />
  </a>
</p>

Runtime Environment Configuration

Populates your environment from `.env` files at **run-time** rather than **build-time**.

- Supports multiple `.env` files.

## README

- [Examples](#examples)
- [Getting started](#getting-started)
- [.env file order of priority](#env-file-order-of-priority)
- [Common use cases](#common-use-cases)

  - [Environment specific config](#environment-specific-config)
  - [Specifing an env file](#specifing-an-env-file)
  - [Specifing an prefix for white-listed environment variables](#specifing-an-prefix-for-white-listed-environment-variables)
  - [Docker for next.js](#docker-nextjs-examples)

- [Arguments and parameters](#arguments-and-parameters)

### Examples

- Example using [Next.js](pages/index.tsx) (see file)

### Getting started

```bash
# .env
NEXT_APP_NEXT="Next.js"
NEXT_APP_CRA="Create React App"
NEXT_APP_NOT_SECRET_CODE="1234"
```

### .env file order of priority

We have implemented some sane defaults that have the following order of priority:

1. `{path-to-file} // from the --path, -p argument`
2. `.env.{key} // from the --env, -e argument`
3. `.env.local`
4. `.env`

Your config is available in `process.env` on the server. We suggest you add `.env.local` to `.gitignore`.

### Common use cases

#### Environment specific config

Frameworks such as Next allow for some nice defaults such as `.env.local, .env.production, .env`. This has the limitation where you may want to run your app in different environments such as "staging, integration, qa" but still build a "production" app with `NODE_ENV=production`. With `hyper-env` this is possible:

```bash
# .env.staging
NEXT_APP_API_HOST="api.staging.com"
# .env.production
NEXT_APP_API_HOST="api.production.com"
# .env.qa
NEXT_APP_API_HOST="api.qa.com"
# .env.integration
NEXT_APP_API_HOST="api.integration.com"
# .env.local
NEXT_APP_API_HOST="api.example.dev"
# .env
NEXT_APP_API_HOST="localhost"
```

for staging you would simply set `APP_ENV=staging` where you run your app:

```
{
  ...
  "scripts": {
    "start": "hyper-env --env APP_ENV -- next start" // where .env.${APP_ENV}
  }
  ...
}
```

Thus `NEXT_APP_API_HOST=api.staging.com` in your staging environment.

> Please keep in mind that you have to pass the name of an environment variable to `--env`, not the value of it.
>
> - ✔ valid usage (macOS): `APP_ENV=staging hyper-env --env APP_ENV -- next start`
> - ❌ common mistake: `hyper-env --env staging -- next start`

#### Specifing an env file

You are also able to specify the path to a specific env file:

```
{
  ...
  "scripts": {
    "start": "hyper-env --path config/.env.defaults -- next start"
  }
  ...
}
```

You can use any combination of these two arguments along with the default `.env, .env.local` to build your runtime config.

#### Specifing an prefix for white-listed environment variables

You are also able to specify the prefix of white-listed environment variables:

```
{
  ...
  "scripts": {
    "start": "hyper-env -- next start"
  }
  ...
}
```

```bash
# .env
NEXT_APP_NEXT="Next.js"
NEXT_APP_CRA="Create React App"
NEXT_APP_NOT_SECRET_CODE="1234"
```

### Arguments and parameters

```bash
$ hyper-env <args> -- <command>
```

- `<command>`

You may pass a command, such as a nodejs entry file to the `hyper-env` cli tool. For example `hyper-scripts`, `next dev`, `next start`

- `--env`, `-e` **(default: APP_ENV)**

Specify the name of an existing environment variable, whose value is the name of an environment you want, to make hyper-env parse an environment specific env-file. For example, you may set `APP_ENV=staging` first and then apply `--env APP_ENV` flag. hyper-env would load `.env.staging, .env.local, .env` in that order with the latter taking priority.

- `--path`, `-p` **(default: '')**

As a significant breaking change we have dropped the ability to specify specific files via the `--env` argument. This argument now specifies environment file to be parsed depending on the running environment. For example `--env APP_ENV` or `-e APP_ENV` where `APP_ENV=staging` reads in `.env.staging`. It is very common for platforms to have `staging, qa, integration` environments that are still built in "production" mode with `NODE_ENV=production`. This allows for that usecase and many others.

Depandand command is now in the format `hyper-env <args> -- <command>`

## docker next.js examples

### Dockerfile

```shell
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat --repository https://mirrors.aliyun.com/ubuntu/
RUN apk add --no-cache libc6-compat

ENV LC_ALL zh_CN.UTF-8

WORKDIR /opt

RUN npm config set registry  https://registry.npmmirror.com

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* .yarnrc.yml package-lock.json* pnpm-lock.yaml* ./
COPY .yarn/releases/ ./.yarn/releases/

RUN \
  if [ -f yarn.lock ]; then yarn --immutable; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /opt
COPY --from=deps /opt/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1
# RUN yarn generate

RUN yarn build-docker
# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache curl
WORKDIR /opt

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
RUN addgroup --system --gid 700 op
RUN adduser --system --uid 700 op

# COPY --from=builder /opt/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown op:op .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=op:op /opt/.next/standalone ./
COPY --from=builder --chown=op:op /opt/.next/static ./.next/static

USER op

# 无需修改
EXPOSE 8080

ENV PORT 8080
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"
COPY start.sh /opt/start.sh
USER root
RUN chmod +x /opt/start.sh
USER op
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD sh start.sh
```

### packages.json scripts

```json
"scripts": {
    "dev": "APP_ENV=rc hyper-env -- next dev",
    "build": "next build",
    "build-docker": "cross-env NEXT_BUILD_ENV_OUTPUT=standalone next build && hyper-next-standalone",
    "g:changeset": "changeset",
    "g:cz": "cz",
    "g:fix-all-files": "eslint . --ext .ts,.tsx,.js,.jsx,.cjs,.mjs,.mdx,.graphql --fix",
    "g:lint-staged-files": "lint-staged --allow-empty",
    "g:version": "changeset version",
    "postinstall": "is-ci || yarn husky install",
    "localbuild": "next build",
    "start": "APP_ENV=prod hyper-env -- next start",
    "start:integration": "APP_ENV=integration hyper-env -- next start",
    "start:prod": "APP_ENV=prod hyper-env -- next start",
    "start:rc": "APP_ENV=rc hyper-env -- next start",
    "docker": "APP_ENV=prod ./node_modules/@hyperse/hyper-env/bin/hyper-env.mjs -- node server.js",
    "docker:integration": "APP_ENV=integration ./node_modules/@hyperse/hyper-env/bin/hyper-env.mjs -- node server.js",
    "docker:prod": "APP_ENV=prod ./node_modules/@hyperse/hyper-env/bin/hyper-env.mjs -- node server.js",
    "docker:rc": "APP_ENV=rc ./node_modules/@hyperse/hyper-env/bin/hyper-env.mjs -- node server.js"
  },
```

### start.sh

```shell
# sleep 100000
exec npm run docker:${DeployEnv}

```

### Next runtime env

packages.json

```json
"next-runtime-env": "^3.2.2",
```

### Note Environment Variables of next.js

next.js Bundling Environment Variables for the Browser at build time

- https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
- hyper-env only attach Environment Variables on `processs.env`
- we need to expose runtime env variables via `next-runtime-env`, otherwise we can not correct use these env variables in browser
