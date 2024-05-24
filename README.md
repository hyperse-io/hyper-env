# hyper-env

Runtime Environment Configuration

Populates your environment from .env files at run-time rather than build-time.

[![Build Status](https://cloud.drone.io/api/badges/hyperse-io/hyper-env/status.svg)](https://cloud.drone.io/hyperse-io/hyper-env)
[![npm version](https://badge.fury.io/js/%40hyperse-io%hyper-env.svg)](https://badge.fury.io/js/%40hyperse-io%2Freact-env)
[![Coverage Status](https://coveralls.io/repos/github/hyperse-io/hyper-env/badge.svg)](https://coveralls.io/github/hyperse-io/hyper-env)

Populates your environment from `.env` files at **run-time** rather than **build-time**.

- Supports multiple `.env` files.

## README

- [Examples](#examples)
- [Getting started](#getting-started)
- [File priority](#env-file-order-of-priority)
- [Common use cases](#common-use-cases)
  - [Environment specific config](#environment-specific-config)
  - [Specifing an env file](#Specifing-an-env-file)
  - [Using with Docker entrypoint](#using-with-docker-entrypoint)
- [Arguments and parameters](#arguments-and-parameters)

### Examples

- Example using [Next.js](examples/next.js/README.md) (see README.md)

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
    "start": "hyper-env --prefix NEXT_APP -- next start"
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

##### Using prefix with jest

You need to add `NEXT_ENV_PREFIX` env variable before jest command if you use `env()` during your tests:

```
{
  ...
  "scripts": {
    "test": "NEXT_ENV_PREFIX=NEXT_APP jest --maxWorkers=3"
  }
  ...
}
```

#### Using with Docker entrypoint

It is possible to use this package as an `ENTRYPOINT` script inside a Dockerfile. This will generate your `__ENV.js` config file when the container boots and allow your `package.json` scripts to remain unchanged. Of course `node` binary must be present in your container.

```dockerfile
FROM node:alpine

ENTRYPOINT yarn hyper-env --env APP_ENV

CMD yarn start
```

### Arguments and parameters

```bash
$ hyper-env <args> -- <command>
```

- `<command>`

You may pass a command, such as a nodejs entry file to the `hyper-env` cli tool. For example `hyper-scripts`, `next dev`, `next start`

- `--env`, `-e` **(default: null)**

Specify the name of an existing environment variable, whose value is the name of an environment you want, to make hyper-env parse an environment specific env-file. For example, you may set `APP_ENV=staging` first and then apply `--env APP_ENV` flag. react-env would load `.env.staging, .env.local, .env` in that order with the latter taking priority.

- `--path`, `-p` **(default: null)**

Specify a specific env file to load e.g. `react-env --path .env.testing` would load `.env.testing, .env.local, .env` in that order with the latter taking priority. a Combination of `--env APP_ENV --path testing` where `APP_ENV=staging` loads `.env.testing, .env.staging, .env.local, .env` as the priority order.

- `--dest`, `-d` **(default: ./public)**

Change the default destination for generating the `__ENV.js` file.

- `--prefix` **(default: NEXT_APP)**

Change the default prefix for white-listed env variables. For exemple `react-env --prefix CUSTOM_PREFIX` will white-list variables like: `CUSTOM_PREFIX_PUBLIC_KEY=my-public-key`

- `--debug` **(default: false)**

Enable debugging for react-env. This will log loaded browser environment variables into your console when running `react-env --debug`

### 3.x.x Breaking changes

---

As a significant breaking change we have dropped the ability to specify specific files via the `--env` argument. This argument now specifies environment file to be parsed depending on the running environment. For example `--env APP_ENV` or `-e APP_ENV` where `APP_ENV=staging` reads in `.env.staging`. It is very common for platforms to have `staging, qa, integration` environments that are still built in "production" mode with `NODE_ENV=production`. This allows for that usecase and many others.

--
You are still able to specify files via the `--path, -p` argument.

---

We have also dropped adding `NODE_ENV` by default as this was a security risk.

Depandand command is now in the format `react-env <args> -- <command>`
