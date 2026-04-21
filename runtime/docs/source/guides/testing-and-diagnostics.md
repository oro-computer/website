# Testing and diagnostics

If the runtime app is real, it needs two things early:

- tests that can run with the app’s actual runtime modules,
- diagnostics that explain behavior without attaching a debugger every time.

This guide sets up both.

## 1) Add a runtime test file

`src/main.test.js`:

```js
import test from 'oro:test'

function summarizeNote(title, body) {
  return `${title}: ${body.slice(0, 20)}`
}

test('summarizeNote truncates the body', (t) => {
  t.equal(
    summarizeNote('Field Report', 'Long text from an inspection run.'),
    'Field Report: Long text from an in'
  )
})
```

The point is not just unit testing in the abstract. The test runs inside the same runtime surface your app uses.

## 2) Run the tests through `oroc`

```bash
oroc run . --test=src/main.test.js
```

If you want more detail while a failure is being diagnosed:

```bash
oroc run . --test=src/main.test.js -V --log-file ./logs/test-run.json
```

Now you have both console output and a durable log artifact.

## 3) Add diagnostics channels for application events

`src/diagnostics.js`:

```js
import { channel } from 'oro:diagnostics'

export const syncChannel = channel('sync')

syncChannel.subscribe('step', (message) => {
  console.log(`[sync] ${message.stage}`, message)
})
```

Publish into that channel from app code:

```js
import { syncChannel } from './diagnostics.js'

await syncChannel.publish('step', {
  stage: 'download-complete',
  count: 42,
})
```

That gives you structured app-level tracing without polluting every module with ad-hoc `console.log` calls.

## 4) Treat logs as a product support artifact

When a user or CI run hits a problem, these commands matter:

```bash
oroc run . -V --log-file ./logs/runtime.json
oroc help json logs
```

The first captures what happened. The second helps discover related CLI logging flags when the support workflow changes.

## 5) Test behavior at the right layer

Use plain `oro:test` assertions for:

- formatting logic,
- reducers and state transforms,
- sync decision logic,
- configuration parsing helpers.

Use runtime runs plus diagnostics for:

- window lifecycle behavior,
- service worker registration,
- packaging or startup failures,
- integration issues with SQLite, notifications, or secure storage.

That keeps tests fast and diagnostics targeted.

## Considerations

- Keep test files close to the code they verify.
- Use diagnostic channels for structured events, not for every line of code.
- Always capture `--log-file` output for flaky or CI-only failures.

## Next

- [Worker threads for heavy work](?p=guides/worker-threads-for-heavy-work)
- [MCP and agent automation](?p=guides/mcp-and-agent-automation)
- [`oro:test`](?p=javascript/test) · [`oro:diagnostics`](?p=javascript/diagnostics)
