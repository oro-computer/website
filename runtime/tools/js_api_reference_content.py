from __future__ import annotations

from textwrap import dedent


def md(text: str) -> str:
    return dedent(text).strip() + "\n"


DESCRIPTION_BY_FAMILY: dict[str, str] = {
    "oro:asn1": "`oro:asn1` parses ASN.1 source text and files into structured module data.",
    "oro:assert": "`oro:assert` provides Node-compatible assertion helpers for tests, runtime checks, and invariants.",
    "oro:async": "`oro:async` exposes async context propagation, deferred values, and resource tracking primitives.",
    "oro:async_hooks": "`oro:async_hooks` exposes hook-based async lifecycle inspection compatible with Node-style instrumentation.",
    "oro:background": "`oro:background` lets you inspect and coordinate the runtime background task surface.",
    "oro:bootstrap": "`oro:bootstrap` downloads and verifies application payloads during bootstrap and update flows.",
    "oro:buffer": "`oro:buffer` provides `Buffer`, `Blob`, and related byte-oriented helpers.",
    "oro:cdp": "`oro:cdp` controls the runtime Chrome DevTools Protocol endpoint used for inspection and debugging.",
    "oro:child_process": "`oro:child_process` launches and manages subprocesses with a Node-compatible API.",
    "oro:clipboard": "`oro:clipboard` reads and writes clipboard text from the current application context.",
    "oro:commonjs": "`oro:commonjs/*` exposes the runtime’s CommonJS loader, cache, and resolution helpers.",
    "oro:conduit": "`oro:conduit` manages the runtime WebSocket conduit used for internal cross-surface messaging.",
    "oro:console": "`oro:console` exposes the runtime console implementation and patch helpers.",
    "oro:constants": "`oro:constants` publishes the runtime’s platform, errno, and low-level constant tables.",
    "oro:cookies": "`oro:cookies` reads and writes cookies for application-controlled origins.",
    "oro:crypto": "`oro:crypto` exposes hashing, random bytes, and bundled sodium-backed helpers.",
    "oro:dbus": "`oro:dbus` connects to DBus and lets JavaScript code call methods, watch signals, and manage names.",
    "oro:dgram": "`oro:dgram` provides UDP sockets and multicast helpers with a Node-compatible API.",
    "oro:diagnostics": "`oro:diagnostics` exposes channels, metrics, and runtime/window diagnostic queries.",
    "oro:did": "`oro:did` parses and manipulates decentralized identifiers and DID URLs.",
    "oro:dns": "`oro:dns` provides DNS lookup helpers and promise-based resolution APIs.",
    "oro:enumeration": "`oro:enumeration` is a small typed-set helper used throughout the runtime surface.",
    "oro:errno": "`oro:errno` converts errno values to names and messages.",
    "oro:errors": "`oro:errors` exports DOM-style and runtime-specific error classes and constants.",
    "oro:events": "`oro:events` provides `EventEmitter`, `EventTarget`, and event primitives used across the runtime.",
    "oro:extension": "`oro:extension` loads native and wasm extensions and reports extension runtime state.",
    "oro:fetch": "`oro:fetch` exposes the runtime fetch stack and standard request/response primitives.",
    "oro:gc": "`oro:gc` lets you register finalizers and control object retention hooks.",
    "oro:hci": "`oro:hci` exposes host controller interface helpers for low-level Bluetooth adapter access.",
    "oro:http": "`oro:http` provides Node-compatible HTTP client and server APIs.",
    "oro:https": "`oro:https` provides HTTPS client and server APIs on top of the runtime TLS stack.",
    "oro:i18n": "`oro:i18n` resolves UI languages, localized messages, and locale-aware metadata.",
    "oro:ip": "`oro:ip` normalizes and validates IP address inputs.",
    "oro:ipc": "`oro:ipc` exposes low-level runtime IPC helpers used to talk to the native host process.",
    "oro:ipfs": "`oro:ipfs` manages the embedded IPFS node and common content operations.",
    "oro:iroh": "`oro:iroh` exposes the runtime’s Iroh transport bindings for peer-to-peer connections and streams.",
    "oro:language": "`oro:language` resolves language names, tags, and related metadata.",
    "oro:latica": "`oro:latica/*` exposes the runtime’s Latica networking primitives, packet helpers, and crypto utilities.",
    "oro:location": "`oro:location` normalizes the current runtime location and origin semantics across platforms.",
    "oro:mime": "`oro:mime` looks up MIME types, extensions, and content-type metadata.",
    "oro:module": "`oro:module` exposes module-loader helpers and builtin-module inspection.",
    "oro:navigation": "`oro:navigation` surfaces the Navigation API state that the runtime makes available to application code.",
    "oro:net": "`oro:net` provides Node-compatible TCP clients and servers.",
    "oro:network": "`oro:network` exposes a higher-level networking surface built on the Latica stack.",
    "oro:node-esm-loader": "`oro:node-esm-loader` exposes the runtime’s ESM loader resolution hook.",
    "oro:npm": "`oro:npm/*` supports package-resolution and service-worker plumbing for NPM-backed modules.",
    "oro:os": "`oro:os` exposes platform, CPU, temporary-directory, and system metadata helpers.",
    "oro:path": "`oro:path` provides cross-platform path manipulation utilities.",
    "oro:process": "`oro:process` exposes runtime process state, env access, signals, and scheduling helpers.",
    "oro:protocol-handlers": "`oro:protocol-handlers` exposes runtime helpers for custom protocol and service-worker routing.",
    "oro:querystring": "`oro:querystring` parses and serializes URL query strings.",
    "oro:semver": "`oro:semver` parses, validates, and compares semantic versions.",
    "oro:service-worker": "`oro:service-worker/*` exposes the service-worker environment, lifecycle objects, and helpers.",
    "oro:shared-worker": "`oro:shared-worker/*` exposes the shared-worker environment and runtime helpers.",
    "oro:signal": "`oro:signal` exposes process-signal constants, conversion helpers, and event listeners.",
    "oro:sqlite": "`oro:sqlite` opens SQLite databases and exposes sync and async query helpers.",
    "oro:stream": "`oro:stream` exposes Node-style streams, Web streams, and pipeline helpers.",
    "oro:string_decoder": "`oro:string_decoder` decodes split byte streams into text without corrupting multibyte characters.",
    "oro:tar": "`oro:tar` opens, creates, streams, and extracts tar archives.",
    "oro:tcp": "`oro:tcp` exposes lower-level TCP client and server helpers alongside the higher-level `oro:net` API.",
    "oro:test": "`oro:test` provides the runtime test harness used by application and module tests.",
    "oro:timers": "`oro:timers` exposes timer primitives, promise-based sleeps, and scheduler helpers.",
    "oro:tls": "`oro:tls` exposes TLS sockets, servers, and certificate-pin helpers.",
    "oro:toml": "`oro:toml` parses and serializes TOML documents.",
    "oro:tty": "`oro:tty` exposes terminal streams and TTY detection helpers.",
    "oro:url": "`oro:url` exposes the WHATWG URL implementation used by the runtime.",
    "oro:usb": "`oro:usb` installs and exposes the runtime WebUSB surface for window contexts.",
    "oro:util": "`oro:util` exposes inspection, debug, and type-checking helpers.",
    "oro:vm": "`oro:vm` runs JavaScript in isolated runtime contexts and manages context windows and workers.",
    "oro:worker": "`oro:worker` re-exports the runtime worker classes for dedicated, shared, and service workers.",
    "oro:worker_threads": "`oro:worker_threads` exposes worker-thread primitives, ports, and environment data helpers.",
    "oro:xpc": "`oro:xpc` connects to macOS XPC services and encodes structured XPC payloads.",
    "oro:zlib": "`oro:zlib` compresses and decompresses buffers and exposes zlib stream helpers.",
}


EXAMPLES_BY_FAMILY: dict[str, str] = {
    "oro:asn1": md(
        """
        Parse ASN.1 source text and inspect the discovered modules:

        ```js
        import { parse } from 'oro:asn1'

        const document = await parse(`
        Demo DEFINITIONS ::= BEGIN
          serialNumber INTEGER ::= 42
        END
        `)

        console.log(document.modulesCount)
        console.log(document.modules[0]?.name)
        ```
        """
    ),
    "oro:assert": md(
        """
        Use assertion helpers for runtime invariants or tests:

        ```js
        import { ok, strictEqual, deepEqual } from 'oro:assert'

        const payload = { id: 7, tags: ['runtime', 'docs'] }

        ok(payload.id > 0)
        strictEqual(payload.tags.length, 2)
        deepEqual(payload.tags, ['runtime', 'docs'])
        ```
        """
    ),
    "oro:async": md(
        """
        Propagate request-scoped state across async boundaries:

        ```js
        import { AsyncLocalStorage } from 'oro:async'

        const store = new AsyncLocalStorage()

        await store.run({ requestId: 'req-42' }, async () => {
          await Promise.resolve()
          console.log(store.getStore().requestId)
        })
        ```
        """
    ),
    "oro:async_hooks": md(
        """
        Inspect async-resource lifecycles as work is scheduled:

        ```js
        import { createHook, executionAsyncId } from 'oro:async_hooks'

        const hook = createHook({
          init(asyncId, type, triggerAsyncId) {
            console.log({ asyncId, type, triggerAsyncId })
          }
        })

        hook.enable()
        queueMicrotask(() => {
          console.log(executionAsyncId())
          hook.disable()
        })
        ```
        """
    ),
    "oro:background": md(
        """
        Check whether background execution is available before scheduling work:

        ```js
        import background from 'oro:background'

        if (background.available) {
          console.log(await background.status())
        }
        ```
        """
    ),
    "oro:bootstrap": md(
        """
        Verify a downloaded artifact before handing it to the bootstrap helper:

        ```js
        import { bootstrap, checkHash } from 'oro:bootstrap'

        const manifest = { url: 'https://updates.example/app.tar' }
        const expectedHash = '0123456789abcdef'

        const ok = await checkHash('./downloads/app.tar', expectedHash, 'sha256')
        if (!ok) throw new Error('artifact hash mismatch')

        const job = bootstrap({ url: manifest.url, dest: './downloads/app.tar' })
        await job.run()
        ```
        """
    ),
    "oro:buffer": md(
        """
        Create byte buffers and wrap them in higher-level binary containers:

        ```js
        import Buffer, { Blob } from 'oro:buffer'

        const bytes = Buffer.from('hello runtime', 'utf8')
        const payload = new Blob([bytes], { type: 'text/plain' })

        console.log(bytes.length)
        console.log(payload.size)
        ```
        """
    ),
    "oro:cdp": md(
        """
        Inspect the current DevTools state and start the endpoint when needed:

        ```js
        import { status, listen, close } from 'oro:cdp'

        console.log(await status())
        await listen({ host: '127.0.0.1', port: 9222 })

        // ...connect a DevTools client...

        await close()
        ```
        """
    ),
    "oro:child_process": md(
        """
        Spawn a subprocess and consume its stdout stream:

        ```js
        import { spawn } from 'oro:child_process'

        const child = spawn('echo', ['hello from runtime'])

        child.stdout.on('data', (chunk) => {
          console.log(chunk.toString())
        })

        await new Promise((resolve, reject) => {
          child.once('close', resolve)
          child.once('error', reject)
        })
        ```
        """
    ),
    "oro:clipboard": md(
        """
        Read and write plain-text clipboard content:

        ```js
        import { writeText, readText, canWriteText } from 'oro:clipboard'

        if (canWriteText()) {
          await writeText('Copied from Oro Runtime')
          console.log(await readText())
        }
        ```
        """
    ),
    "oro:commonjs": md(
        """
        Resolve CommonJS modules from the current ES module:

        ```js
        import { Module, isBuiltin } from 'oro:commonjs'

        const require = Module.createRequire(import.meta.url)

        console.log(isBuiltin('fs'))
        console.log(require('./package.json').name)
        ```
        """
    ),
    "oro:conduit": md(
        """
        Connect to the runtime conduit and inspect its current status:

        ```js
        import { Conduit } from 'oro:conduit'

        const conduit = new Conduit({ id: 'docs' })
        await conduit.connect()

        console.log(await Conduit.status())

        await conduit.close()
        ```
        """
    ),
    "oro:console": md(
        """
        Patch the global console so application logs use the runtime console implementation:

        ```js
        import { patchGlobalConsole } from 'oro:console'

        patchGlobalConsole(globalThis.console)

        console.info('runtime console is active')
        ```
        """
    ),
    "oro:constants": md(
        """
        Use named constants instead of hard-coding errno or signal values:

        ```js
        import { EACCES, SIGTERM } from 'oro:constants'

        console.log({ EACCES, SIGTERM })
        ```
        """
    ),
    "oro:cookies": md(
        """
        Set, read, and remove cookies for an application-controlled origin:

        ```js
        import { set, get, remove } from 'oro:cookies'

        await set('https://app.example', 'session=abc123; Path=/; HttpOnly')
        console.log(await get('https://app.example'))
        await remove('https://app.example', 'session')
        ```
        """
    ),
    "oro:crypto": md(
        """
        Generate random bytes and hash them with the runtime digest helper:

        ```js
        import { randomBytes, createDigest, murmur3 } from 'oro:crypto'

        const nonce = randomBytes(16)
        const digest = await createDigest('sha256', nonce)

        console.log(digest.toString('hex'))
        console.log(murmur3('oro-runtime'))
        ```
        """
    ),
    "oro:dbus": md(
        """
        Check DBus availability and open a session-bus connection:

        ```js
        import { availability, connect, BUS } from 'oro:dbus'

        const state = await availability()

        if (state.available) {
          const bus = await connect({ bus: BUS.SESSION })
          console.log(bus.id)
          await bus.close()
        }
        ```
        """
    ),
    "oro:dgram": md(
        """
        Create a UDP socket and send a datagram:

        ```js
        import Buffer from 'oro:buffer'
        import { createSocket } from 'oro:dgram'

        const socket = createSocket('udp4')

        socket.on('message', (message, rinfo) => {
          console.log(rinfo.address, message.toString())
        })

        socket.bind(41234)
        socket.send(Buffer.from('ping'), 41235, '127.0.0.1')
        ```
        """
    ),
    "oro:diagnostics": md(
        """
        Publish and subscribe to a diagnostics channel:

        ```js
        import { channel } from 'oro:diagnostics'

        const buildChannel = channel('build')

        buildChannel.subscribe('step', (message) => {
          console.log(message.step)
        })

        await buildChannel.publish('step', { step: 'bundle-ready' })
        ```
        """
    ),
    "oro:did": md(
        """
        Parse a DID and a DID URL:

        ```js
        import { parse, parseUrl } from 'oro:did'

        const did = parse('did:key:z6Mkkx...')
        const url = parseUrl('did:key:z6Mkkx...#keys-1')

        console.log(did.method)
        console.log(url.fragment)
        ```
        """
    ),
    "oro:dns": md(
        """
        Resolve hostnames with the promise-based DNS helpers:

        ```js
        import { lookup } from 'oro:dns/promises'

        const record = await lookup('oro.computer')

        console.log(record.address)
        console.log(record.family)
        ```
        """
    ),
    "oro:enumeration": md(
        """
        Use `Enumeration` when you want a typed, readable set of allowed values:

        ```js
        import Enumeration from 'oro:enumeration'

        const states = new Enumeration(['draft', 'ready', 'shipped'])

        console.log(states.has('ready'))
        console.log([...states])
        ```
        """
    ),
    "oro:errno": md(
        """
        Convert errno values to names and human-readable messages:

        ```js
        import { EACCES, getName, getMessage } from 'oro:errno'

        console.log(getName(EACCES))
        console.log(getMessage(EACCES))
        ```
        """
    ),
    "oro:errors": md(
        """
        Construct runtime error types directly when surfacing failures:

        ```js
        import { AbortError, NotFoundError } from 'oro:errors'

        const abort = new AbortError('request cancelled')
        const missing = new NotFoundError('resource not found')

        console.log(abort.name, missing.name)
        ```
        """
    ),
    "oro:events": md(
        """
        Use `EventEmitter` for familiar event-based application code:

        ```js
        import EventEmitter from 'oro:events'

        const bus = new EventEmitter()

        bus.on('ready', (value) => console.log(value))
        bus.emit('ready', { ok: true })
        ```
        """
    ),
    "oro:extension": md(
        """
        Load a runtime extension and inspect the resulting binding:

        ```js
        import { load, stats } from 'oro:extension'

        const extension = await load('image-tools', { allow: ['resize'] })

        console.log(extension.type)
        console.log(await stats())

        await extension.unload()
        ```
        """
    ),
    "oro:fetch": md(
        """
        Use the runtime fetch stack exactly like standard web fetch:

        ```js
        import fetch from 'oro:fetch'

        const response = await fetch('https://example.com/api/status')
        const data = await response.json()

        console.log(data)
        ```
        """
    ),
    "oro:gc": md(
        """
        Register a finalizer on an object that owns runtime resources:

        ```js
        import { ref, unref } from 'oro:gc'

        const resource = {
          [Symbol.for('oro.runtime.gc.finalize')]() {
            console.log('cleaning up resource')
          }
        }

        ref(resource)
        unref(resource)
        ```
        """
    ),
    "oro:hci": md(
        """
        Inspect local Bluetooth adapters before opening a low-level HCI socket:

        ```js
        import { listAdapters, getAdapter } from 'oro:hci'

        const adapters = listAdapters()
        console.log(adapters)

        if (adapters.length > 0) {
          console.log(getAdapter(adapters[0].devId))
        }
        ```
        """
    ),
    "oro:http": md(
        """
        Start a small HTTP server with the Node-compatible API:

        ```js
        import { createServer } from 'oro:http'

        const server = createServer((req, res) => {
          res.writeHead(200, { 'content-type': 'text/plain' })
          res.end('hello from oro:http')
        })

        server.listen(8080, '127.0.0.1')
        ```
        """
    ),
    "oro:https": md(
        """
        Issue an HTTPS request with the familiar client helper:

        ```js
        import process from 'oro:process'
        import { get } from 'oro:https'

        get('https://example.com', (res) => {
          res.on('data', (chunk) => process.stdout.write(chunk))
        })
        ```
        """
    ),
    "oro:i18n": md(
        """
        Resolve the current UI language and look up a localized message:

        ```js
        import { getUILanguage, getMessage } from 'oro:i18n'

        console.log(getUILanguage())
        console.log(getMessage('menu.file.open'))
        ```
        """
    ),
    "oro:ip": md(
        """
        Normalize user-provided IP input before using it in socket code:

        ```js
        import { normalizeIPv4, isIPv4 } from 'oro:ip'

        const address = normalizeIPv4('127.000.000.001')

        console.log(address)
        console.log(isIPv4(address))
        ```
        """
    ),
    "oro:ipc": md(
        """
        Wait for the runtime IPC bridge and post a structured message:

        ```js
        import { ready, postMessage, debug } from 'oro:ipc'

        debug(true)
        await ready()

        postMessage({ type: 'docs-demo', at: Date.now() })
        ```
        """
    ),
    "oro:ipfs": md(
        """
        Ensure the embedded IPFS node is running before adding local content:

        ```js
        import { ensureStarted, add, status } from 'oro:ipfs'

        await ensureStarted({ repoPath: './ipfs-repo' })
        console.log(await status())

        const { cid } = await add('/absolute/path/to/report.txt')
        console.log(cid)
        ```
        """
    ),
    "oro:iroh": md(
        """
        Initialize the Iroh transport and create an endpoint:

        ```js
        import { ensureInitialized, Endpoint } from 'oro:iroh'

        await ensureInitialized()

        const endpoint = await Endpoint.create()
        await endpoint.bind()

        console.log(await endpoint.nodeAddr())

        await endpoint.close()
        ```
        """
    ),
    "oro:language": md(
        """
        Resolve language tags and metadata from user input:

        ```js
        import { lookup, describe } from 'oro:language'

        console.log(lookup('en-US'))
        console.log(describe('English'))
        ```
        """
    ),
    "oro:latica": md(
        """
        Use Latica helpers directly when you are working at the packet and transport layer:

        ```js
        import { sha256 } from 'oro:latica'

        const topic = await sha256(new TextEncoder().encode('docs-demo'))

        console.log(topic)
        ```
        """
    ),
    "oro:location": md(
        """
        Inspect the runtime-normalized location values for the current context:

        ```js
        import location from 'oro:location'

        console.log(location.href)
        console.log(location.origin)
        ```
        """
    ),
    "oro:mime": md(
        """
        Look up MIME metadata for a type or extension:

        ```js
        import { lookupSync } from 'oro:mime'

        console.log(lookupSync('application/json'))
        console.log(lookupSync('.png'))
        ```
        """
    ),
    "oro:module": md(
        """
        Inspect builtin modules and create a `require()` function when you need one:

        ```js
        import Module, { builtinModules, isBuiltin, createRequire } from 'oro:module'

        const require = createRequire(import.meta.url)

        console.log(isBuiltin('oro:path'))
        console.log(Object.keys(builtinModules).length)
        console.log(typeof Module)
        console.log(typeof require)
        ```
        """
    ),
    "oro:navigation": md(
        """
        Read the current navigation entry and listen for browser-style navigation events:

        ```js
        import navigation from 'oro:navigation'

        console.log(navigation.currentEntry?.url)

        navigation.addEventListener('navigate', (event) => {
          console.log(event.destination.url)
        })
        ```
        """
    ),
    "oro:net": md(
        """
        Build a TCP echo server with the Node-compatible net API:

        ```js
        import { createServer } from 'oro:net'

        const server = createServer({}, (socket) => {
          socket.on('data', (chunk) => socket.write(chunk))
        })

        server.listen(4040, '127.0.0.1')
        ```
        """
    ),
    "oro:network": md(
        """
        Start the higher-level networking surface and attach event listeners:

        ```js
        import network from 'oro:network'

        const bus = await network({})

        bus.on('error', console.error)
        bus.on('message', (message) => console.log(message))
        ```
        """
    ),
    "oro:node-esm-loader": md(
        """
        Reuse the runtime resolver from a custom ESM loader hook:

        ```js
        import resolve from 'oro:node-esm-loader'

        export async function resolveHook(specifier, context, nextResolve) {
          return resolve(specifier, context, nextResolve)
        }
        ```
        """
    ),
    "oro:npm": md(
        """
        Resolve an NPM specifier to the runtime module URL it will load:

        ```js
        import { resolve } from 'oro:npm/module'

        const resolved = resolve('react', import.meta.url)

        console.log(resolved?.url)
        console.log(resolved?.type)
        ```
        """
    ),
    "oro:os": md(
        """
        Inspect the current platform and locate scratch space:

        ```js
        import { arch, platform, tmpdir, cpus } from 'oro:os'

        console.log(platform(), arch())
        console.log(tmpdir())
        console.log(cpus().length)
        ```
        """
    ),
    "oro:path": md(
        """
        Compose paths without branching on platform separators:

        ```js
        import { resolve, join, dirname, basename } from 'oro:path'

        const absolute = resolve('dist', 'assets', 'logo.svg')

        console.log(absolute)
        console.log(dirname(absolute))
        console.log(basename(join('/tmp', 'report.txt')))
        ```
        """
    ),
    "oro:process": md(
        """
        Inspect process state and schedule work on the next tick:

        ```js
        import process, { env, hrtime, nextTick } from 'oro:process'

        console.log(env.PATH)
        console.log(hrtime())

        nextTick(() => {
          console.log(process.pid)
        })
        ```
        """
    ),
    "oro:protocol-handlers": md(
        """
        Ask the runtime which service worker is currently handling a custom scheme:

        ```js
        import { getServiceWorker } from 'oro:protocol-handlers'

        const worker = await getServiceWorker({ scheme: 'npm' })

        console.log(worker)
        ```
        """
    ),
    "oro:querystring": md(
        """
        Parse and serialize query strings with the Node-compatible helpers:

        ```js
        import { stringify, parse } from 'oro:querystring'

        const query = stringify({ q: 'oro runtime', page: 2 })

        console.log(query)
        console.log(parse(query))
        ```
        """
    ),
    "oro:semver": md(
        """
        Validate and compare versions before running upgrade logic:

        ```js
        import { valid, compare, gt } from 'oro:semver'

        console.log(valid('1.4.0'))
        console.log(compare('1.4.0', '1.3.9'))
        console.log(gt('2.0.0', '1.9.0'))
        ```
        """
    ),
    "oro:service-worker": md(
        """
        Use the runtime service-worker helpers from inside a service-worker scope:

        ```js
        import { env } from 'oro:service-worker'

        if (env) {
          self.addEventListener('fetch', (event) => {
            event.respondWith(fetch(event.request))
          })
        }
        ```
        """
    ),
    "oro:shared-worker": md(
        """
        Launch a shared worker and communicate through its shared port:

        ```js
        import { SharedWorker } from 'oro:shared-worker'

        const worker = new SharedWorker(new URL('./shared.js', import.meta.url))

        worker.port.start()
        worker.port.postMessage({ type: 'warmup' })
        ```
        """
    ),
    "oro:signal": md(
        """
        Listen for runtime process signals using the signal helper surface:

        ```js
        import signal from 'oro:signal'

        signal.addEventListener('SIGTERM', (event) => {
          console.log(event.type)
        })
        ```
        """
    ),
    "oro:sqlite": md(
        """
        Open an in-memory database and run a few synchronous queries:

        ```js
        import { open, OPEN_CREATE, OPEN_MEMORY } from 'oro:sqlite'

        const db = open(':memory:', { flags: OPEN_CREATE | OPEN_MEMORY })

        db.exec('create table notes (id integer primary key, title text)')
        db.exec(\"insert into notes (title) values ('hello')\")

        console.log(db.query('select * from notes'))
        ```
        """
    ),
    "oro:stream": md(
        """
        Connect streams together with the pipeline helper:

        ```js
        import process from 'oro:process'
        import { Readable, Writable, pipelinePromise } from 'oro:stream'

        const source = Readable.from(['oro', ' ', 'runtime'])
        const sink = new Writable({
          write(chunk, _encoding, done) {
            process.stdout.write(chunk)
            done()
          }
        })

        await pipelinePromise(source, sink)
        ```
        """
    ),
    "oro:string_decoder": md(
        """
        Decode chunked UTF-8 data without splitting multibyte characters:

        ```js
        import Buffer from 'oro:buffer'
        import StringDecoder from 'oro:string_decoder'

        const decoder = new StringDecoder('utf8')
        const chunks = [Buffer.from([0xe2, 0x82]), Buffer.from([0xac])]

        console.log(decoder.write(chunks[0]))
        console.log(decoder.write(chunks[1]))
        ```
        """
    ),
    "oro:tar": md(
        """
        Build a tar archive in memory and inspect its entries:

        ```js
        import Buffer from 'oro:buffer'
        import { createInMemory } from 'oro:tar'

        const archive = await createInMemory()

        await archive.append({ path: 'hello.txt' }, Buffer.from('hello'))
        await archive.finalize()

        console.log(await archive.entries())
        ```
        """
    ),
    "oro:tcp": md(
        """
        Open a lower-level TCP server when you want more direct socket control:

        ```js
        import { createServer } from 'oro:tcp'

        const server = createServer((socket) => {
          socket.write(Buffer.from('connected'))
        })

        server.listen({ port: 5050, host: '127.0.0.1' })
        ```
        """
    ),
    "oro:test": md(
        """
        Write runtime tests with the built-in test harness:

        ```js
        import test from 'oro:test'

        test('querystring roundtrip', async (t) => {
          t.equal('a=1', new URLSearchParams({ a: '1' }).toString())
        })
        ```
        """
    ),
    "oro:timers": md(
        """
        Sleep without writing your own timeout wrapper:

        ```js
        import { sleep } from 'oro:timers'

        await sleep(250)

        console.log('quarter second elapsed')
        ```
        """
    ),
    "oro:tls": md(
        """
        Configure TLS pins before opening pinned connections:

        ```js
        import { setTlsPins, getTlsPins, clearTlsPins } from 'oro:tls'

        await setTlsPins('sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
        console.log(await getTlsPins())
        await clearTlsPins()
        ```
        """
    ),
    "oro:toml": md(
        """
        Parse configuration and emit updated TOML back to disk:

        ```js
        import { parse, stringify } from 'oro:toml'

        const config = parse('name = \"oro\"\\nport = 8080')
        config.debug = true

        console.log(stringify(config))
        ```
        """
    ),
    "oro:tty": md(
        """
        Detect interactive terminals before enabling richer output:

        ```js
        import { isatty } from 'oro:tty'

        console.log(isatty(0))
        console.log(isatty(1))
        ```
        """
    ),
    "oro:url": md(
        """
        Use the WHATWG URL implementation for robust URL parsing:

        ```js
        import URL from 'oro:url'

        const url = new URL('https://oro.computer/docs?project=runtime')

        console.log(url.pathname)
        console.log(url.searchParams.get('project'))
        ```
        """
    ),
    "oro:usb": md(
        """
        Install the runtime WebUSB surface and request a device in window contexts:

        ```js
        import { installNavigatorUSB } from 'oro:usb'

        const usb = installNavigatorUSB()

        if (usb) {
          console.log(await usb.getDevices())
          // const device = await usb.requestDevice({ filters: [{ vendorId: 0x1209 }] })
        }
        ```
        """
    ),
    "oro:util": md(
        """
        Use the runtime debug helper and common type predicates:

        ```js
        import { debug, isTypedArray } from 'oro:util'

        const log = debug('docs')
        const payload = new Uint8Array([1, 2, 3])

        log('payload ready')
        console.log(isTypedArray(payload))
        ```
        """
    ),
    "oro:vm": md(
        """
        Run a script inside an isolated context object:

        ```js
        import { runInContext } from 'oro:vm'

        const context = { answer: 41 }
        const result = await runInContext('answer + 1', context)

        console.log(result)
        ```
        """
    ),
    "oro:worker": md(
        """
        Launch a dedicated worker through the runtime worker surface:

        ```js
        import Worker from 'oro:worker'

        const worker = new Worker(new URL('./worker.js', import.meta.url), {
          workerData: { job: 'thumbnail' }
        })

        worker.postMessage({ type: 'start' })
        ```
        """
    ),
    "oro:worker_threads": md(
        """
        Pass environment data into worker threads and communicate with message channels:

        ```js
        import { MessageChannel, setEnvironmentData } from 'oro:worker_threads'

        setEnvironmentData('traceId', 'req-42')

        const { port1, port2 } = new MessageChannel()
        port1.onmessage = (event) => console.log(event.data)
        port2.postMessage({ ok: true })
        ```
        """
    ),
    "oro:xpc": md(
        """
        Open an XPC connection, send a request, and close it cleanly:

        ```js
        import { availability, connect } from 'oro:xpc'

        const state = await availability()

        if (state.available) {
          const connection = await connect({ service: 'com.example.agent' })
          await connection.sendAndForget({ type: 'ping' })
          await connection.close()
        }
        ```
        """
    ),
    "oro:zlib": md(
        """
        Compress and decompress buffers with the promise-based helpers:

        ```js
        import { gzip, gunzip } from 'oro:zlib'

        const compressed = await gzip('hello runtime')
        const restored = await gunzip(compressed)

        console.log(restored.toString())
        ```
        """
    ),
}


DEFAULT_SEE_ALSO: tuple[tuple[str, str], ...] = (
    ("Module index", "javascript/module-index"),
    ("All module specifiers", "javascript/all-modules"),
)
