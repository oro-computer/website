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

## API reference

<!-- GENERATED: ORO_API_REFERENCE_START -->

### Module specifiers

```text
oro:ai
oro:ai/ann
oro:ai/chat
oro:ai/llm
oro:ai/whisper
```

### TypeScript declarations

<details>
<summary><code>oro:ai</code></summary>

```ts
declare module 'oro:ai' {
  namespace _default {
    export { llm }
    export { chat }
  }
  export default _default
  import llm from 'oro:ai/llm'
  import chat from 'oro:ai/chat'
  export { llm, chat }
}
```

</details>

<details>
<summary><code>oro:ai/ann</code></summary>

```ts
declare module 'oro:ai/ann' {
  /**
   * Create a new ANN model.
   * @param {ConstructorParameters<typeof Network>[0]} options
   * @returns {Promise<Network>}
   */
  export function create(
    options: ConstructorParameters<typeof Network>[0]
  ): Promise<Network>
  /**
   * Load a model from disk.
   * @param {string} path
   * @param {{name?:string}} [options]
   * @returns {Promise<Network>}
   */
  export function load(
    path: string,
    options?: {
      name?: string
    }
  ): Promise<Network>
  /**
   * Retrieve metadata for registered ANN models.
   * @returns {Promise<Array<object>>}
   */
  export function list(): Promise<Array<object>>
  /**
   * Remove a model by instance, id, or name.
   * @param {Network|number|string} target
   * @returns {Promise<boolean>}
   */
  export function remove(target: Network | number | string): Promise<boolean>
  /**
   * Supported loss function identifiers.
   */
  export type LossFunction = string
  /**
   * Supported loss function identifiers.
   * @enum {string}
   */
  export const LossFunction: Readonly<{
    CrossEntropy: 'crossEntropy'
    MeanSquaredError: 'meanSquaredError'
  }>
  /**
   * Represents a managed ANN model within the runtime.
   */
  export class Network {
    /**
     * Create a new ANN model inside the runtime.
     * @param {{
     *   name?: string,
     *   inputSize: number,
     *   outputSize: number,
     *   outputActivation?: string,
     *   hiddenLayers?: Array<{size:number, activation?:string}>
     * }} options
     * @returns {Promise<Network>}
     */
    static create(options: {
      name?: string
      inputSize: number
      outputSize: number
      outputActivation?: string
      hiddenLayers?: Array<{
        size: number
        activation?: string
      }>
    }): Promise<Network>
    /**
     * Load an ANN model from disk and register it with the runtime.
     * @param {string} path Absolute path to a serialized model file.
     * @param {{name?:string}} [options]
     * @returns {Promise<Network>}
     */
    static load(
      path: string,
      options?: {
        name?: string
      }
    ): Promise<Network>
    /**
     * List registered ANN models.
     * @returns {Promise<Array<object>>}
     */
    static list(): Promise<Array<object>>
    constructor(metadata?: any)
    /** @returns {number|null} Unique model identifier assigned by the runtime. */
    get id(): number | null
    /** @returns {string} Model name assigned during creation (optional). */
    get name(): string
    /** @returns {number} Number of input features per example. */
    get inputSize(): number
    /** @returns {number} Number of output units per example. */
    get outputSize(): number
    /** @returns {string} Activation function applied on the output layer. */
    get outputActivation(): string
    /** @returns {Array<{size:number, activation:string}>} Hidden layer definitions. */
    get hiddenLayers(): Array<{
      size: number
      activation: string
    }>
    /**
     * Persist the model state to disk.
     * @param {string} path Absolute path where the model should be stored.
     * @returns {Promise<boolean>}
     */
    save(path: string): Promise<boolean>
    /**
     * Train the network with labeled data.
     * @param {ArrayLike<number>|Array<ArrayLike<number>>|Float32Array|{data:Float32Array,rows:number,columns:number}} features
     * @param {ArrayLike<number>|Array<ArrayLike<number>>|Float32Array|{data:Float32Array,rows:number,columns:number}} labels
     * @param {{
     *   loss?: string,
     *   batchSize?: number,
     *   learningRate?: number,
     *   searchTime?: number,
     *   regularizationStrength?: number,
     *   momentumFactor?: number,
     *   maxEpochs?: number,
     *   shuffle?: boolean,
     *   verbose?: boolean,
     *   featureColumns?: number,
     *   featureRows?: number,
     *   labelColumns?: number,
     *   labelRows?: number
     * }} [options]
     * @returns {Promise<{loss:number,accuracy:number,epochs:number,durationMs:number}>}
     */
    train(
      features:
        | ArrayLike<number>
        | Array<ArrayLike<number>>
        | Float32Array
        | {
            data: Float32Array
            rows: number
            columns: number
          },
      labels:
        | ArrayLike<number>
        | Array<ArrayLike<number>>
        | Float32Array
        | {
            data: Float32Array
            rows: number
            columns: number
          },
      options?: {
        loss?: string
        batchSize?: number
        learningRate?: number
        searchTime?: number
        regularizationStrength?: number
        momentumFactor?: number
        maxEpochs?: number
        shuffle?: boolean
        verbose?: boolean
        featureColumns?: number
        featureRows?: number
        labelColumns?: number
        labelRows?: number
      }
    ): Promise<{
      loss: number
      accuracy: number
      epochs: number
      durationMs: number
    }>
    /**
     * Run inference on the network.
     * @param {ArrayLike<number>|Array<ArrayLike<number>>|Float32Array|{data:Float32Array,rows:number,columns:number}} input
     * @param {{rows?:number, columns?:number}} [options]
     * @returns {Promise<{rows:number,columns:number,logits:Float32Array,classes:Int32Array}>}
     */
    predict(
      input:
        | ArrayLike<number>
        | Array<ArrayLike<number>>
        | Float32Array
        | {
            data: Float32Array
            rows: number
            columns: number
          },
      options?: {
        rows?: number
        columns?: number
      }
    ): Promise<{
      rows: number
      columns: number
      logits: Float32Array
      classes: Int32Array
    }>
    /**
     * Compute classification accuracy for labeled samples.
     * @param {ArrayLike<number>|Array<ArrayLike<number>>|Float32Array|{data:Float32Array,rows:number,columns:number}} features
     * @param {ArrayLike<number>|Array<ArrayLike<number>>|Float32Array|{data:Float32Array,rows:number,columns:number}} labels
     * @param {{featureColumns?:number,featureRows?:number,labelColumns?:number,labelRows?:number}} [options]
     * @returns {Promise<number>}
     */
    accuracy(
      features:
        | ArrayLike<number>
        | Array<ArrayLike<number>>
        | Float32Array
        | {
            data: Float32Array
            rows: number
            columns: number
          },
      labels:
        | ArrayLike<number>
        | Array<ArrayLike<number>>
        | Float32Array
        | {
            data: Float32Array
            rows: number
            columns: number
          },
      options?: {
        featureColumns?: number
        featureRows?: number
        labelColumns?: number
        labelRows?: number
      }
    ): Promise<number>
    /**
     * Destroy the network within the runtime.
     * @returns {Promise<boolean>}
     */
    remove(): Promise<boolean>
  }
  namespace _default {
    export { Network }
    export { LossFunction }
    export { create }
    export { load }
    export { list }
    export { remove }
  }
  export default _default
}
```

</details>

<details>
<summary><code>oro:ai/chat</code></summary>

```ts
declare module 'oro:ai/chat' {
  /**
   * @typedef {import('./llm.js').ModelOptions} ModelOptions
   * @typedef {import('./llm.js').ModelLoadOptions} ModelLoadOptions
   * @typedef {import('./llm.js').ContextOptions} ContextOptions
   */
  /**
   * @typedef {{
   *   prompt?: string,
   *   antiprompts?: (string|Set<string>)[]
   * }} GenerateOptions
   */
  export class ChatMessageEvent {
    /**
     * @param {string} type
     * @param {MessageEventInit & { finished?: boolean }} options
     */
    constructor(
      type: string,
      options: MessageEventInit & {
        finished?: boolean
      }
    )
    get finished(): boolean
    #private
  }
  /**
   * @typedef {{
   *   id: string,
   *   role: string,
   *   content: string
   * }} MessageOptions
   */
  export class Message {
    constructor(options: any)
    /**
     * @type {string}
     */
    get id(): string
    /**
     * @type {string}
     */
    get role(): string
    /**
     * @type {string}
     */
    get content(): string
    #private
  }
  /**
   * @typedef {{
   *   id?: string,
   *   prompt?: string,
   *   antiprompts?: Set<string>|string[]
   * }} SessionOptions
   */
  export class Session extends EventTarget {
    [x: number]: (options: any) => {
      args: any[]
      handle(id: any, conduit: any): Promise<void>
    }
    /**
     * @param {Context} context
     * @param {SessionOptions=} [options]
     */
    constructor(context: Context, options?: SessionOptions | undefined)
    /**
     * @type {string}
     */
    get id(): string
    /**
     * @type {string}
     */
    get prompt(): string
    /**
     * @type {Context}
     */
    get context(): Context
    /**
     * @type {Conduit}
     */
    get conduit(): Conduit
    /**
     * @type {boolean}
     */
    get started(): boolean
    /**
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * @type {boolean}
     */
    get generating(): boolean
    /**
     * @type {Message[]}
     */
    get messages(): Message[]
    /**
     * @type {Set<string>}
     */
    get antiprompts(): Set<string>
    /**
     * @param {Model} model
     * @param {(ModelLoadOptions & ContextOptions)=} [options]
     * @return {Promise}
     */
    load(
      model: Model,
      options?: (ModelLoadOptions & ContextOptions) | undefined
    ): Promise<any>
    /**
     * @return {Promise}
     */
    start(): Promise<any>
    /**
     * @param {GenerateOptions=} [options]
     * @return {Promise<object>}
     */
    generate(options?: GenerateOptions | undefined): Promise<object>
    message(
      options: any
    ): Promise<string | object | Uint8Array<ArrayBufferLike>>
    #private
  }
  /**
   * @typedef {SessionOptions & {
   *   model: string | (ModelOptions & ModelLoadOptions),
   *   prompt?: string,
   *   context?: ContextOptions
   * }} ChatOptions
   */
  export class Chat extends Session {
    /**
     * @param {ChatOptions} options
     */
    constructor(options: ChatOptions)
    /**
     * @type {Model}
     */
    get model(): Model
    /**
     * @type {Promise}
     */
    get ready(): Promise<any>
    /**
     * @return {Promise}
     */
    load(): Promise<any>
    #private
  }
  namespace _default {
    export { Message }
    export { Session }
    export { Chat }
  }
  export default _default
  export type ModelOptions = import('oro:ai/llm').ModelOptions
  export type ModelLoadOptions = import('oro:ai/llm').ModelLoadOptions
  export type ContextOptions = import('oro:ai/llm').ContextOptions
  export type GenerateOptions = {
    prompt?: string
    antiprompts?: (string | Set<string>)[]
  }
  export type MessageOptions = {
    id: string
    role: string
    content: string
  }
  export type SessionOptions = {
    id?: string
    prompt?: string
    antiprompts?: Set<string> | string[]
  }
  export type ChatOptions = SessionOptions & {
    model: string | (ModelOptions & ModelLoadOptions)
    prompt?: string
    context?: ContextOptions
  }
  import { Context } from 'oro:ai/llm'
  import { Conduit } from 'oro:conduit'
  import { Model } from 'oro:ai/llm'
}
```

</details>

<details>
<summary><code>oro:ai/llm</code></summary>

```ts
declare module 'oro:ai/llm' {
  /**
   * @typedef {{ name: string, }} ModelOptions
   * @typedef {{ directory?: string, gpuLayerCount?: number }} ModelLoadOptions
   */
  export class Model {
    /**
     * @param {ModelOptions} options
     */
    constructor(options: ModelOptions)
    /**
     * @type {string}
     */
    get id(): string
    /**
     * @type {string}
     */
    get name(): string
    /**
     * @type {Promise}
     */
    get ready(): Promise<any>
    /**
     * `true` if the model is loaded, otherwise `false`.
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * Loads the model it not already loaded.
     * @param {ModelLoadOptions=} [options]
     */
    load(options?: ModelLoadOptions | undefined): Promise<any>
    toJSON(): {
      name: string
    }
    #private
  }
  /**
   * @typedef {{ name: string, }} LoRAOptions
   * @typedef {{ directory?: string, id?: string|number }} LoRALoadOptions
   * @typedef {{ scale?: number }} LoraAttachOptions
   */
  export class LoRA {
    /**
     * @param {Model} model
     * @param {LoRAOptions} options
     */
    constructor(model: Model, options: LoRAOptions)
    /**
     * @type {string}
     */
    get id(): string
    /**
     * @type {string}
     */
    get name(): string
    /**
     * @type {Promise}
     */
    get ready(): Promise<any>
    /**
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * @type {Model}
     */
    get model(): Model
    /**
     * Load this adapter. Pass `options.id` to reference an already-loaded LoRA
     * without providing `name`/`model` metadata.
     * @param {LoRALoadOptions=} [options]
     */
    load(options?: LoRALoadOptions | undefined): Promise<any>
    /**
     * Attach a LoRA to a context.
     * @param {Context} context
     * @param {LoraAttachOptions=} [options]
     * @return {Promise}
     */
    attach(
      context: Context,
      options?: LoraAttachOptions | undefined
    ): Promise<any>
    /**
     * @param {Context} context
     * @return {Promise}
     */
    detach(context: Context): Promise<any>
    toJSON(): {
      name: string
      model: {
        name: string
      }
    }
    #private
  }
  /**
   * @typedef {
   *   context: Context,
   *   model: Model,
   *   lora: LoRA
   * {}} LoRAAttachmentOptions
   */
  export class LoRAAttachment {
    /**
     * @param {LoRAAttachmentOptions} options
     */
    constructor(options: LoRAAttachmentOptions)
    /**
     * @type {Context}
     */
    get context(): Context
    /**
     * @type {Model}
     */
    get model(): Model
    /**
     * @type {LoRA}
     */
    get lora(): LoRA
    toJSON(): {
      context: any
      model: any
      lora: any
    }
    #private
  }
  /**
   * @typedef {{
   *   size?: number,
   *   minP?: number,
   *   temp?: number,
   *   topK?: number,
   *   topP?: number,
   *   id?: string
   * }} ContextOptions
   *
   * @typedef {{
   *   id: string,
   *   size: number,
   *   used: number
   * }} ContextStats
   */
  export class Context {
    /**
     * @param {ContextOptions=} [options]
     */
    constructor(options?: ContextOptions | undefined)
    /**
     * @type {string}
     */
    get id(): string
    /**
     * @type {number}
     */
    get size(): number
    /**
     * @type {boolean}
     */
    get loaded(): boolean
    /**
     * @type {Model}
     */
    get model(): Model
    /**
     * @type {Promise}
     */
    get ready(): Promise<any>
    /**
     * @type {ContextOptions}
     */
    get options(): ContextOptions
    /**
     * @type {LoRAAttachment[]}
     */
    get attachments(): LoRAAttachment[]
    /**
     * @type {LoRA[]}
     */
    get adapters(): LoRA[]
    /**
     * @param {Model} model
     * @param {ContextOptions=} [options]
     * @return {Promise}
     */
    load(model: Model, options?: ContextOptions | undefined): Promise<any>
    /**
     * @return {Promise<ContextStats>}
     */
    stats(): Promise<ContextStats>
    toJSON(): {
      id: string
      size: number
      model: {
        name: string
      }
    }
    #private
  }
  namespace _default {
    export { Model }
    export { LoRA }
    export { LoRAAttachment }
    export { Context }
  }
  export default _default
  export type ModelOptions = {
    name: string
  }
  export type ModelLoadOptions = {
    directory?: string
    gpuLayerCount?: number
  }
  export type LoRAOptions = {
    name: string
  }
  export type LoRALoadOptions = {
    directory?: string
    id?: string | number
  }
  export type LoraAttachOptions = {
    scale?: number
  }
  /**
   * : Context,
   *   model: Model,
   *   lora: LoRA
   * {}} LoRAAttachmentOptions
   */
  export type context = any
  export type ContextOptions = {
    size?: number
    minP?: number
    temp?: number
    topK?: number
    topP?: number
    id?: string
  }
  export type ContextStats = {
    id: string
    size: number
    used: number
  }
}
```

</details>

<details>
<summary><code>oro:ai/whisper</code></summary>

```ts
declare module 'oro:ai/whisper' {
  export function listModels(): Promise<any>
  export function unloadModel(idOrName: any): Promise<any>
  /**
   * Speech-to-text model backed by `whisper.cpp`.
   *
   * ```js
   * import whisper from 'oro:ai/whisper'
   *
   * const model = new whisper.WhisperModel({ name: 'ggml-base.en.bin' })
   * await model.load({ directory: '/path/to/models' })
   * const result = await model.transcribe(new Int16Array(audioBuffer), {
   *   sampleRate: 44100,
   *   channels: 2,
   *   normalize: true,
   *   onSegment (segment) {
   *     console.log('partial', segment.text)
   *   }
   * })
   * console.log(result.text)
   * ```
   */
  export class WhisperModel {
    /**
     * @param {{ id?: number|null, name?: string|null }} [options]
     * Provide either a numeric `id` (returned from previous loads) or a model
     * `name` that exists on disk.
     */
    constructor({ id, name }?: { id?: number | null; name?: string | null })
    get id(): number
    get name(): string
    get loaded(): boolean
    /**
     * Loads the whisper model into memory (if not already loaded).
     *
     * @param {{ directory?: string, threadCount?: number, statePoolLimit?: number, useGPU?: boolean, gpuDevice?: number }} [options]
     * @return {Promise<any>} Resolves when the model is ready.
     */
    load(options?: {
      directory?: string
      threadCount?: number
      statePoolLimit?: number
      useGPU?: boolean
      gpuDevice?: number
    }): Promise<any>
    /**
     * Unload the model from memory.
     * @return {Promise<any>}
     */
    unload(): Promise<any>
    /**
     * Transcribe PCM audio to text.
     *
     * @param {ArrayBufferView|ArrayBuffer} audio PCM samples (Float32Array or Int16Array recommended).
     * @param {import('../index.js').WhisperTranscribeOptions} [options]
     *   - `sampleRate`: source sample rate (defaults to 16 kHz).
     *   - `channels`: channel count (multi-channel buffers are averaged to mono).
     *   - `normalize`: scale waveform before inference.
     *   - `stream`: emit partial segments via `onSegment`.
     *   - `signal`: optional AbortSignal to cancel the request.
     *   - `enableVAD`: enable voice-activity detection (when supported by the runtime).
     *   - `vadModelPath`: optional path to a dedicated VAD model (GGUF) to use when `enableVAD` is true.
     * @return {Promise<any>} Resolves with transcription metadata.
     */
    transcribe(
      audio: ArrayBufferView | ArrayBuffer,
      options?: any
    ): Promise<any>
    #private
  }
  namespace _default {
    export { WhisperModel }
    export { listModels }
    export { unloadModel }
  }
  export default _default
}
```

</details>

<!-- GENERATED: ORO_API_REFERENCE_END -->
