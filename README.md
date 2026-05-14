# nlogs

Structured logger for Node.js with category-based filtering, AsyncLocalStorage trace IDs, and built-in timers and counters. Configurable through environment variables - no setup code in most cases.

## Installation

Requires Node.js 20 or newer.

```bash
npm install nlogs
```

## Quick start

```ts
import Logger from 'nlogs'

const logger = new Logger()

logger.info('server started', { port: 3000 })
logger.error(new Error('boom'))
```

The `dark` ANSI formatter is used in development and switches to `json` when `NODE_ENV=production`.

## Log levels

```
trace -> debug -> log -> info -> warn -> error -> fatal
```

`warn`, `error`, and `fatal` are written to stderr; the rest go to stdout. `fatal` is always emitted regardless of filtering.

Filter at runtime:

```bash
NLOGS_LEVEL=warn node app.js          # warn, error, fatal
NLOGS_LEVELS=info,error node app.js   # exact set
NLOGS_LEVEL=off node app.js           # silence everything except fatal
```

## Categories

Each logger instance has a category. By default it is derived from the source file path. Pass a class, an explicit string, or `module`/`import.meta` to override:

```ts
class UserService {}
const log = new Logger(UserService)
```

Filter categories with `NLOGS_CATEGORY` (syntax mirrors `debug`: comma-separated entries, leading `-` for negation, `module:category` for module-scoped rules, `*` for everything):

```bash
NLOGS_CATEGORY="auth, payments, -auth:internal" node app.js
```

## Trace context

`Logger.run` opens an AsyncLocalStorage context. Every log inside the callback - and any async work it spawns - carries the same `traceId`.

```ts
Logger.run({ userId: '42' }, async () => {
  logger.info('handling request')
  await processOrder()
})
```

A string argument sets the `traceId` directly:

```ts
Logger.run(req.headers['x-trace-id'], () => handler(req))
```

Nested calls chain: the outer traceId is preserved in `_traceIds`.

## Timers and counters

```ts
logger.time('db')
await query()
logger.timeEnd('db')

const counter = logger.count('events')
counter()        // increments and logs
counter.end()    // closes the counter
```

`logger.time(label)` and `logger.count(label)` return a handle. Calling it logs a checkpoint; `.end()` finalises and frees the slot. Without a label each call returns a fresh handle.

## Formatters

| Value    | When to use                             |
|----------|-----------------------------------------|
| `dark`   | Terminal with dark background (default) |
| `light`  | Terminal with light background          |
| `string` | Plain text, no ANSI                     |
| `json`   | One JSON object per line (prod default) |

Override with `NLOGS_FORMATTER`.

## Environment variables

Naming convention: `NLOGS_*` (preferred), `LOGGER_*` (fallback), unprefixed (compatibility with `DEBUG`, `LEVEL`, `CATEGORY`, ...).

| Variable                   | Purpose                                |
|----------------------------|----------------------------------------|
| `NLOGS_PROJECT`            | Project name in meta                   |
| `NLOGS_SERVICE`            | Service name in meta                   |
| `NLOGS_CATEGORY`           | Category allow/deny list               |
| `NLOGS_DEBUG`              | Same syntax for `debug`/`trace` levels |
| `NLOGS_LEVEL`              | Minimum level (or exact level)         |
| `NLOGS_LEVELS`             | Exact set of allowed levels            |
| `NLOGS_FORMATTER`          | `json`/`string`/`light`/`dark`         |
| `NLOGS_STRICT_LEVEL_RULES` | Pre-filter by level (bool)             |

`DEBUG=*` and `NODE_DEBUG=*` are honoured as aliases for `NLOGS_DEBUG`.

## NestJS adapter

```ts
import { NestjsLogger } from 'nlogs'

const app = await NestFactory.create(AppModule, {
  logger: new NestjsLogger(),
})
```

## Template logger

`TemplateLogger` injects a fixed template applied to every message:

```ts
import { TemplateLogger, Logger } from 'nlogs'

class RequestLogger extends TemplateLogger {
  constructor(req: Request) {
    super('http')
    this.template('[', Logger.highlight(req.method), req.url, ']')
  }
}
```

## License

MIT - see [LICENSE](./LICENSE).
