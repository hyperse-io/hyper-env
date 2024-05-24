# @hyperse-io/hyper-env <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

Runtime Environment Configuration

Populates your environment from .env files at run-time rather than build-time.

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

Specify the name of an existing environment variable, whose value is the name of an environment you want, to make hyper-env parse an environment specific env-file. For example, you may set `APP_ENV=staging` first and then apply `--env APP_ENV` flag. react-env would load `.env.staging, .env.local, .env` in that order with the latter taking priority.

- `--path`, `-p` **(default: '')**

Enable debugging for react-env. This will log loaded browser environment variables into your console when running `react-env --debug`

As a significant breaking change we have dropped the ability to specify specific files via the `--env` argument. This argument now specifies environment file to be parsed depending on the running environment. For example `--env APP_ENV` or `-e APP_ENV` where `APP_ENV=staging` reads in `.env.staging`. It is very common for platforms to have `staging, qa, integration` environments that are still built in "production" mode with `NODE_ENV=production`. This allows for that usecase and many others.

Depandand command is now in the format `hyper-env <args> -- <command>`
