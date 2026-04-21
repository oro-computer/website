# Worker threads for heavy work

The main window should stay responsive. If a task is CPU-heavy or processes large blobs of text or binary data, move it to
`oro:worker_threads`.

This pattern is useful for markdown indexing, import parsing, thumbnailing, encryption, and other work that should not
block user interaction.

## 1) Start a worker from the main window

`src/main.js`:

```js
import { Worker } from 'oro:worker_threads'

const worker = new Worker(new URL('./analysis-worker.js', import.meta.url).toString(), {
  workerData: {
    note: 'The runtime should stay responsive even while long text is being processed.',
  },
})

worker.on('message', (message) => {
  console.log('analysis result', message)
})
```

## 2) Read `workerData` inside the worker

`src/analysis-worker.js`:

```js
import { parentPort, workerData } from 'oro:worker_threads'

const words = String(workerData.note)
  .split(/\s+/)
  .filter(Boolean)
  .length

parentPort?.postMessage({ words })
```

This keeps startup simple: pass the initial job in `workerData`, send later updates with `postMessage`.

## 3) Use workers for bounded jobs

Good worker jobs:

- parse and validate imported data,
- build a search index,
- hash or encrypt large payloads,
- generate derived artifacts like previews or summaries.

Bad worker jobs:

- ordinary button click handlers,
- short UI state updates,
- tasks that mostly wait on network or filesystem I/O.

## 4) Use environment data for shared process context

If every worker needs the same process-wide value, use environment data:

```js
import {
  setEnvironmentData,
  getEnvironmentData,
} from 'oro:worker_threads'

setEnvironmentData('apiBaseUrl', 'https://api.example.com')

console.log(getEnvironmentData('apiBaseUrl'))
```

That is cleaner than hand-threading the same config through every constructor.

## 5) Shut workers down when the job is done

Workers are not fire-and-forget:

```js
worker.on('message', (message) => {
  console.log(message)
  worker.terminate()
})
```

If a job can be reused across windows, use a shared worker instead.

## Next

- [Shared workers across windows](?p=guides/shared-workers-across-windows)
- [Testing and diagnostics](?p=guides/testing-and-diagnostics)
- [`oro:worker_threads`](?p=javascript/worker_threads)
