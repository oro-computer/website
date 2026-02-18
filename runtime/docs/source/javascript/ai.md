# `oro:ai`

`oro:ai` exposes local AI helpers. It currently exports two modules:

- `llm` — model/context management
- `chat` — a chat/session helper that streams tokens as events

## Import

```js
import ai from 'oro:ai'
```

## Minimal chat session

```js
import ai from 'oro:ai'

const chat = new ai.chat.Chat({
  model: 'my-model-name',
  prompt: 'You are a helpful assistant.',
})

await chat.load()

chat.addEventListener('message', (event) => {
  // event is a MessageEvent with an additional `finished` flag
  console.log(event.data?.toString?.() ?? event.data)
})

await chat.message({ prompt: 'Hello!' })
await chat.generate({ prompt: 'Tell me a joke.' })
```

