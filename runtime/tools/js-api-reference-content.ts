// Evaluated content from the original Python generator; preserve strings exactly.
export const DESCRIPTION_BY_FAMILY: Record<string, string> = {
  "oro:asn1": "`oro:asn1` parses ASN.1 source text and files into structured module data.",
  "oro:assert": "`oro:assert` provides Node-compatible assertion helpers for tests, runtime checks, and invariants.",
  "oro:async": "`oro:async` exposes async context propagation, deferred values, and resource tracking primitives.",
  "oro:async_hooks": "`oro:async_hooks` exposes hook-based async lifecycle inspection compatible with Node-style instrumentation.",
  "oro:background": "`oro:background` lets you inspect and coordinate the runtime background task surface.",
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
  "oro:zlib": "`oro:zlib` compresses and decompresses buffers and exposes zlib stream helpers."
}
export const EXAMPLES_BY_FAMILY: Record<string, string> = {
  "oro:asn1": "Parse ASN.1 source text and inspect the discovered modules:\n\n```js\nimport { parse } from 'oro:asn1'\n\nconst document = await parse(`\nDemo DEFINITIONS ::= BEGIN\n  serialNumber INTEGER ::= 42\nEND\n`)\n\nconsole.log(document.modulesCount)\nconsole.log(document.modules[0]?.name)\n```\n",
  "oro:assert": "Use assertion helpers for runtime invariants or tests:\n\n```js\nimport { ok, strictEqual, deepEqual } from 'oro:assert'\n\nconst payload = { id: 7, tags: ['runtime', 'docs'] }\n\nok(payload.id > 0)\nstrictEqual(payload.tags.length, 2)\ndeepEqual(payload.tags, ['runtime', 'docs'])\n```\n",
  "oro:async": "Propagate request-scoped state across async boundaries:\n\n```js\nimport { AsyncLocalStorage } from 'oro:async'\n\nconst store = new AsyncLocalStorage()\n\nawait store.run({ requestId: 'req-42' }, async () => {\n  await Promise.resolve()\n  console.log(store.getStore().requestId)\n})\n```\n",
  "oro:async_hooks": "Inspect async-resource lifecycles as work is scheduled:\n\n```js\nimport { createHook, executionAsyncId } from 'oro:async_hooks'\n\nconst hook = createHook({\n  init(asyncId, type, triggerAsyncId) {\n    console.log({ asyncId, type, triggerAsyncId })\n  }\n})\n\nhook.enable()\nqueueMicrotask(() => {\n  console.log(executionAsyncId())\n  hook.disable()\n})\n```\n",
  "oro:background": "Check whether background execution is available before scheduling work:\n\n```js\nimport background from 'oro:background'\n\nif (background.available) {\n  console.log(await background.status())\n}\n```\n",
  "oro:buffer": "Create byte buffers and wrap them in higher-level binary containers:\n\n```js\nimport Buffer, { Blob } from 'oro:buffer'\n\nconst bytes = Buffer.from('hello runtime', 'utf8')\nconst payload = new Blob([bytes], { type: 'text/plain' })\n\nconsole.log(bytes.length)\nconsole.log(payload.size)\n```\n",
  "oro:cdp": "Inspect the current DevTools state and start the endpoint when needed:\n\n```js\nimport { status, listen, close } from 'oro:cdp'\n\nconsole.log(await status())\nawait listen({ host: '127.0.0.1', port: 9222 })\n\n// ...connect a DevTools client...\n\nawait close()\n```\n",
  "oro:child_process": "Spawn a subprocess and consume its stdout stream:\n\n```js\nimport { spawn } from 'oro:child_process'\n\nconst child = spawn('echo', ['hello from runtime'])\n\nchild.stdout.on('data', (chunk) => {\n  console.log(chunk.toString())\n})\n\nawait new Promise((resolve, reject) => {\n  child.once('close', resolve)\n  child.once('error', reject)\n})\n```\n",
  "oro:clipboard": "Read and write plain-text clipboard content:\n\n```js\nimport { writeText, readText, canWriteText } from 'oro:clipboard'\n\nif (canWriteText()) {\n  await writeText('Copied from Oro Runtime')\n  console.log(await readText())\n}\n```\n",
  "oro:commonjs": "Resolve CommonJS modules from the current ES module:\n\n```js\nimport { Module, isBuiltin } from 'oro:commonjs'\n\nconst require = Module.createRequire(import.meta.url)\n\nconsole.log(isBuiltin('fs'))\nconsole.log(require('./package.json').name)\n```\n",
  "oro:conduit": "Connect to the runtime conduit and inspect its current status:\n\n```js\nimport { Conduit } from 'oro:conduit'\n\nconst conduit = new Conduit({ id: 'docs' })\nawait conduit.connect()\n\nconsole.log(await Conduit.status())\n\nawait conduit.close()\n```\n",
  "oro:console": "Patch the global console so application logs use the runtime console implementation:\n\n```js\nimport { patchGlobalConsole } from 'oro:console'\n\npatchGlobalConsole(globalThis.console)\n\nconsole.info('runtime console is active')\n```\n",
  "oro:constants": "Use named constants instead of hard-coding errno or signal values:\n\n```js\nimport { EACCES, SIGTERM } from 'oro:constants'\n\nconsole.log({ EACCES, SIGTERM })\n```\n",
  "oro:cookies": "Set, read, and remove cookies for an application-controlled origin:\n\n```js\nimport { set, get, remove } from 'oro:cookies'\n\nawait set('https://app.example', 'session=abc123; Path=/; HttpOnly')\nconsole.log(await get('https://app.example'))\nawait remove('https://app.example', 'session')\n```\n",
  "oro:crypto": "Generate random bytes and hash them with the runtime digest helper:\n\n```js\nimport { randomBytes, createDigest, murmur3 } from 'oro:crypto'\n\nconst nonce = randomBytes(16)\nconst digest = await createDigest('sha256', nonce)\n\nconsole.log(digest.toString('hex'))\nconsole.log(murmur3('hello-runtime'))\n```\n",
  "oro:dbus": "Check DBus availability and open a session-bus connection:\n\n```js\nimport { availability, connect, BUS } from 'oro:dbus'\n\nconst state = await availability()\n\nif (state.available) {\n  const bus = await connect({ bus: BUS.SESSION })\n  console.log(bus.id)\n  await bus.close()\n}\n```\n",
  "oro:dgram": "Create a UDP socket and send a datagram:\n\n```js\nimport Buffer from 'oro:buffer'\nimport { createSocket } from 'oro:dgram'\n\nconst socket = createSocket('udp4')\n\nsocket.on('message', (message, rinfo) => {\n  console.log(rinfo.address, message.toString())\n})\n\nsocket.bind(41234)\nsocket.send(Buffer.from('ping'), 41235, '127.0.0.1')\n```\n",
  "oro:diagnostics": "Publish and subscribe to a diagnostics channel:\n\n```js\nimport { channel } from 'oro:diagnostics'\n\nconst buildChannel = channel('build')\n\nbuildChannel.subscribe('step', (message) => {\n  console.log(message.step)\n})\n\nawait buildChannel.publish('step', { step: 'bundle-ready' })\n```\n",
  "oro:did": "Parse a DID and a DID URL:\n\n```js\nimport { parse, parseUrl } from 'oro:did'\n\nconst did = parse('did:key:z6Mkkx...')\nconst url = parseUrl('did:key:z6Mkkx...#keys-1')\n\nconsole.log(did.method)\nconsole.log(url.fragment)\n```\n",
  "oro:dns": "Resolve hostnames with the promise-based DNS helpers:\n\n```js\nimport { lookup } from 'oro:dns/promises'\n\nconst record = await lookup('oro.computer')\n\nconsole.log(record.address)\nconsole.log(record.family)\n```\n",
  "oro:enumeration": "Use `Enumeration` when you want a typed, readable set of allowed values:\n\n```js\nimport Enumeration from 'oro:enumeration'\n\nconst states = new Enumeration(['draft', 'ready', 'shipped'])\n\nconsole.log(states.has('ready'))\nconsole.log([...states])\n```\n",
  "oro:errno": "Convert errno values to names and human-readable messages:\n\n```js\nimport { EACCES, getName, getMessage } from 'oro:errno'\n\nconsole.log(getName(EACCES))\nconsole.log(getMessage(EACCES))\n```\n",
  "oro:errors": "Construct runtime error types directly when surfacing failures:\n\n```js\nimport { AbortError, NotFoundError } from 'oro:errors'\n\nconst abort = new AbortError('request cancelled')\nconst missing = new NotFoundError('resource not found')\n\nconsole.log(abort.name, missing.name)\n```\n",
  "oro:events": "Use `EventEmitter` for familiar event-based application code:\n\n```js\nimport EventEmitter from 'oro:events'\n\nconst bus = new EventEmitter()\n\nbus.on('ready', (value) => console.log(value))\nbus.emit('ready', { ok: true })\n```\n",
  "oro:extension": "Load a runtime extension and inspect the resulting binding:\n\n```js\nimport { load, stats } from 'oro:extension'\n\nconst extension = await load('image-tools', { allow: ['resize'] })\n\nconsole.log(extension.type)\nconsole.log(await stats())\n\nawait extension.unload()\n```\n",
  "oro:fetch": "Use the runtime fetch stack exactly like standard web fetch:\n\n```js\nimport fetch from 'oro:fetch'\n\nconst response = await fetch('https://example.com/api/status')\nconst data = await response.json()\n\nconsole.log(data)\n```\n",
  "oro:gc": "Register a finalizer on an object that owns runtime resources:\n\n```js\nimport { ref, unref } from 'oro:gc'\n\nconst resource = {\n  [Symbol.for('oro.runtime.gc.finalize')]() {\n    console.log('cleaning up resource')\n  }\n}\n\nref(resource)\nunref(resource)\n```\n",
  "oro:hci": "Inspect local Bluetooth adapters before opening a low-level HCI socket:\n\n```js\nimport { listAdapters, getAdapter } from 'oro:hci'\n\nconst adapters = listAdapters()\nconsole.log(adapters)\n\nif (adapters.length > 0) {\n  console.log(getAdapter(adapters[0].devId))\n}\n```\n",
  "oro:http": "Start a small HTTP server with the Node-compatible API:\n\n```js\nimport { createServer } from 'oro:http'\n\nconst server = createServer((req, res) => {\n  res.writeHead(200, { 'content-type': 'text/plain' })\n  res.end('hello from oro:http')\n})\n\nserver.listen(8080, '127.0.0.1')\n```\n",
  "oro:https": "Issue an HTTPS request with the familiar client helper:\n\n```js\nimport process from 'oro:process'\nimport { get } from 'oro:https'\n\nget('https://example.com', (res) => {\n  res.on('data', (chunk) => process.stdout.write(chunk))\n})\n```\n",
  "oro:i18n": "Resolve the current UI language and look up a localized message:\n\n```js\nimport { getUILanguage, getMessage } from 'oro:i18n'\n\nconsole.log(getUILanguage())\nconsole.log(getMessage('menu.file.open'))\n```\n",
  "oro:ip": "Normalize user-provided IP input before using it in socket code:\n\n```js\nimport { normalizeIPv4, isIPv4 } from 'oro:ip'\n\nconst address = normalizeIPv4('127.000.000.001')\n\nconsole.log(address)\nconsole.log(isIPv4(address))\n```\n",
  "oro:ipc": "Wait for the runtime IPC bridge and post a structured message:\n\n```js\nimport { ready, postMessage, debug } from 'oro:ipc'\n\ndebug(true)\nawait ready()\n\npostMessage({ type: 'docs-demo', at: Date.now() })\n```\n",
  "oro:ipfs": "Ensure the embedded IPFS node is running before adding local content:\n\n```js\nimport { ensureStarted, add, status } from 'oro:ipfs'\n\nawait ensureStarted({ repoPath: './ipfs-repo' })\nconsole.log(await status())\n\nconst { cid } = await add('/absolute/path/to/report.txt')\nconsole.log(cid)\n```\n",
  "oro:iroh": "Initialize the Iroh transport and create an endpoint:\n\n```js\nimport { ensureInitialized, Endpoint } from 'oro:iroh'\n\nawait ensureInitialized()\n\nconst endpoint = await Endpoint.create()\nawait endpoint.bind()\n\nconsole.log(await endpoint.nodeAddr())\n\nawait endpoint.close()\n```\n",
  "oro:language": "Resolve language tags and metadata from user input:\n\n```js\nimport { lookup, describe } from 'oro:language'\n\nconsole.log(lookup('en-US'))\nconsole.log(describe('English'))\n```\n",
  "oro:latica": "Use Latica helpers directly when you are working at the packet and transport layer:\n\n```js\nimport { sha256 } from 'oro:latica'\n\nconst topic = await sha256(new TextEncoder().encode('docs-demo'))\n\nconsole.log(topic)\n```\n",
  "oro:location": "Inspect the runtime-normalized location values for the current context:\n\n```js\nimport location from 'oro:location'\n\nconsole.log(location.href)\nconsole.log(location.origin)\n```\n",
  "oro:mime": "Look up MIME metadata for a type or extension:\n\n```js\nimport { lookupSync } from 'oro:mime'\n\nconsole.log(lookupSync('application/json'))\nconsole.log(lookupSync('.png'))\n```\n",
  "oro:module": "Inspect builtin modules and create a `require()` function when you need one:\n\n```js\nimport Module, { builtinModules, isBuiltin, createRequire } from 'oro:module'\n\nconst require = createRequire(import.meta.url)\n\nconsole.log(isBuiltin('oro:path'))\nconsole.log(Object.keys(builtinModules).length)\nconsole.log(typeof Module)\nconsole.log(typeof require)\n```\n",
  "oro:navigation": "Read the current navigation entry and listen for browser-style navigation events:\n\n```js\nimport navigation from 'oro:navigation'\n\nconsole.log(navigation.currentEntry?.url)\n\nnavigation.addEventListener('navigate', (event) => {\n  console.log(event.destination.url)\n})\n```\n",
  "oro:net": "Build a TCP echo server with the Node-compatible net API:\n\n```js\nimport { createServer } from 'oro:net'\n\nconst server = createServer({}, (socket) => {\n  socket.on('data', (chunk) => socket.write(chunk))\n})\n\nserver.listen(4040, '127.0.0.1')\n```\n",
  "oro:network": "Start the higher-level networking surface and attach event listeners:\n\n```js\nimport network from 'oro:network'\n\nconst bus = await network({})\n\nbus.on('error', console.error)\nbus.on('message', (message) => console.log(message))\n```\n",
  "oro:npm": "Resolve an NPM specifier to the runtime module URL it will load:\n\n```js\nimport { resolve } from 'oro:npm/module'\n\nconst resolved = resolve('react', import.meta.url)\n\nconsole.log(resolved?.url)\nconsole.log(resolved?.type)\n```\n",
  "oro:os": "Inspect the current platform and locate scratch space:\n\n```js\nimport { arch, platform, tmpdir, cpus } from 'oro:os'\n\nconsole.log(platform(), arch())\nconsole.log(tmpdir())\nconsole.log(cpus().length)\n```\n",
  "oro:path": "Compose paths without branching on platform separators:\n\n```js\nimport { resolve, join, dirname, basename } from 'oro:path'\n\nconst absolute = resolve('dist', 'assets', 'logo.svg')\n\nconsole.log(absolute)\nconsole.log(dirname(absolute))\nconsole.log(basename(join('/tmp', 'report.txt')))\n```\n",
  "oro:process": "Inspect process state and schedule work on the next tick:\n\n```js\nimport process, { env, hrtime, nextTick } from 'oro:process'\n\nconsole.log(env.PATH)\nconsole.log(hrtime())\n\nnextTick(() => {\n  console.log(process.pid)\n})\n```\n",
  "oro:protocol-handlers": "Ask the runtime which service worker is currently handling a custom scheme:\n\n```js\nimport { getServiceWorker } from 'oro:protocol-handlers'\n\nconst worker = await getServiceWorker({ scheme: 'npm' })\n\nconsole.log(worker)\n```\n",
  "oro:querystring": "Parse and serialize query strings with the Node-compatible helpers:\n\n```js\nimport { stringify, parse } from 'oro:querystring'\n\nconst query = stringify({ q: 'oro runtime', page: 2 })\n\nconsole.log(query)\nconsole.log(parse(query))\n```\n",
  "oro:semver": "Validate and compare versions before running upgrade logic:\n\n```js\nimport { valid, compare, gt } from 'oro:semver'\n\nconsole.log(valid('1.4.0'))\nconsole.log(compare('1.4.0', '1.3.9'))\nconsole.log(gt('2.0.0', '1.9.0'))\n```\n",
  "oro:service-worker": "Use the runtime service-worker helpers from inside a service-worker scope:\n\n```js\nimport { env } from 'oro:service-worker'\n\nif (env) {\n  self.addEventListener('fetch', (event) => {\n    event.respondWith(fetch(event.request))\n  })\n}\n```\n",
  "oro:shared-worker": "Launch a shared worker and communicate through its shared port:\n\n```js\nimport { SharedWorker } from 'oro:shared-worker'\n\nconst worker = new SharedWorker(new URL('./shared.js', import.meta.url))\n\nworker.port.start()\nworker.port.postMessage({ type: 'warmup' })\n```\n",
  "oro:signal": "Listen for runtime process signals using the signal helper surface:\n\n```js\nimport signal from 'oro:signal'\n\nsignal.addEventListener('SIGTERM', (event) => {\n  console.log(event.type)\n})\n```\n",
  "oro:sqlite": "Open an in-memory database and run a few synchronous queries:\n\n```js\nimport { open, OPEN_CREATE, OPEN_MEMORY } from 'oro:sqlite'\n\nconst db = open(':memory:', { flags: OPEN_CREATE | OPEN_MEMORY })\n\ndb.exec('create table notes (id integer primary key, title text)')\ndb.exec(\"insert into notes (title) values ('hello')\")\n\nconsole.log(db.query('select * from notes'))\n```\n",
  "oro:stream": "Connect streams together with the pipeline helper:\n\n```js\nimport process from 'oro:process'\nimport { Readable, Writable, pipelinePromise } from 'oro:stream'\n\nconst source = Readable.from(['oro', ' ', 'runtime'])\nconst sink = new Writable({\n  write(chunk, _encoding, done) {\n    process.stdout.write(chunk)\n    done()\n  }\n})\n\nawait pipelinePromise(source, sink)\n```\n",
  "oro:string_decoder": "Decode chunked UTF-8 data without splitting multibyte characters:\n\n```js\nimport Buffer from 'oro:buffer'\nimport StringDecoder from 'oro:string_decoder'\n\nconst decoder = new StringDecoder('utf8')\nconst chunks = [Buffer.from([0xe2, 0x82]), Buffer.from([0xac])]\n\nconsole.log(decoder.write(chunks[0]))\nconsole.log(decoder.write(chunks[1]))\n```\n",
  "oro:tar": "Build a tar archive in memory and inspect its entries:\n\n```js\nimport Buffer from 'oro:buffer'\nimport { createInMemory } from 'oro:tar'\n\nconst archive = await createInMemory()\n\nawait archive.append({ path: 'hello.txt' }, Buffer.from('hello'))\nawait archive.finalize()\n\nconsole.log(await archive.entries())\n```\n",
  "oro:tcp": "Open a lower-level TCP server when you want more direct socket control:\n\n```js\nimport { createServer } from 'oro:tcp'\n\nconst server = createServer((socket) => {\n  socket.write(Buffer.from('connected'))\n})\n\nserver.listen({ port: 5050, host: '127.0.0.1' })\n```\n",
  "oro:test": "Write runtime tests with the built-in test harness:\n\n```js\nimport test from 'oro:test'\n\ntest('querystring roundtrip', async (t) => {\n  t.equal('a=1', new URLSearchParams({ a: '1' }).toString())\n})\n```\n",
  "oro:timers": "Sleep without writing your own timeout wrapper:\n\n```js\nimport { sleep } from 'oro:timers'\n\nawait sleep(250)\n\nconsole.log('quarter second elapsed')\n```\n",
  "oro:tls": "Configure TLS pins before opening pinned connections:\n\n```js\nimport { setTlsPins, getTlsPins, clearTlsPins } from 'oro:tls'\n\nawait setTlsPins('sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')\nconsole.log(await getTlsPins())\nawait clearTlsPins()\n```\n",
  "oro:toml": "Parse configuration and emit updated TOML back to disk:\n\n```js\nimport { parse, stringify } from 'oro:toml'\n\nconst config = parse('name = \"oro\"\\nport = 8080')\nconfig.debug = true\n\nconsole.log(stringify(config))\n```\n",
  "oro:tty": "Detect interactive terminals before enabling richer output:\n\n```js\nimport { isatty } from 'oro:tty'\n\nconsole.log(isatty(0))\nconsole.log(isatty(1))\n```\n",
  "oro:url": "Use the WHATWG URL implementation for robust URL parsing:\n\n```js\nimport URL from 'oro:url'\n\nconst url = new URL('https://oro.computer/docs?project=runtime')\n\nconsole.log(url.pathname)\nconsole.log(url.searchParams.get('project'))\n```\n",
  "oro:usb": "Install the runtime WebUSB surface and request a device in window contexts:\n\n```js\nimport { installNavigatorUSB } from 'oro:usb'\n\nconst usb = installNavigatorUSB()\n\nif (usb) {\n  console.log(await usb.getDevices())\n  // const device = await usb.requestDevice({ filters: [{ vendorId: 0x1209 }] })\n}\n```\n",
  "oro:util": "Use the runtime debug helper and common type predicates:\n\n```js\nimport { debug, isTypedArray } from 'oro:util'\n\nconst log = debug('docs')\nconst payload = new Uint8Array([1, 2, 3])\n\nlog('payload ready')\nconsole.log(isTypedArray(payload))\n```\n",
  "oro:vm": "Run a script inside an isolated context object:\n\n```js\nimport { runInContext } from 'oro:vm'\n\nconst context = { answer: 41 }\nconst result = await runInContext('answer + 1', context)\n\nconsole.log(result)\n```\n",
  "oro:worker": "Launch a dedicated worker through the runtime worker surface:\n\n```js\nimport Worker from 'oro:worker'\n\nconst worker = new Worker(new URL('./worker.js', import.meta.url), {\n  workerData: { job: 'thumbnail' }\n})\n\nworker.postMessage({ type: 'start' })\n```\n",
  "oro:worker_threads": "Pass environment data into worker threads and communicate with message channels:\n\n```js\nimport { MessageChannel, setEnvironmentData } from 'oro:worker_threads'\n\nsetEnvironmentData('traceId', 'req-42')\n\nconst { port1, port2 } = new MessageChannel()\nport1.onmessage = (event) => console.log(event.data)\nport2.postMessage({ ok: true })\n```\n",
  "oro:xpc": "Open an XPC connection, send a request, and close it cleanly:\n\n```js\nimport { availability, connect } from 'oro:xpc'\n\nconst state = await availability()\n\nif (state.available) {\n  const connection = await connect({ service: 'com.example.agent' })\n  await connection.sendAndForget({ type: 'ping' })\n  await connection.close()\n}\n```\n",
  "oro:zlib": "Compress and decompress buffers with the promise-based helpers:\n\n```js\nimport { gzip, gunzip } from 'oro:zlib'\n\nconst compressed = await gzip('hello runtime')\nconst restored = await gunzip(compressed)\n\nconsole.log(restored.toString())\n```\n"
}
export const GUIDE_REFS_BY_FAMILY: Record<string, readonly (readonly [string, string])[]> = {
  "oro:application": [
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ],
    [
      "Lifecycle hooks and deep links",
      "guides/lifecycle-hooks-and-deep-links"
    ],
    [
      "Desktop integrations",
      "guides/desktop-integrations"
    ]
  ],
  "oro:assert": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:cdp": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:child_process": [
    [
      "Configure your runtime project",
      "guides/configure-your-runtime-project"
    ],
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:clipboard": [
    [
      "Desktop integrations",
      "guides/desktop-integrations"
    ]
  ],
  "oro:console": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:crypto": [
    [
      "Secure storage and sessions",
      "guides/secure-storage-and-sessions"
    ]
  ],
  "oro:diagnostics": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:errors": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:extension": [
    [
      "Native extensions",
      "guides/native-extensions"
    ]
  ],
  "oro:fetch": [
    [
      "Calling HTTP APIs",
      "guides/calling-http-apis"
    ],
    [
      "Offline-first with service workers",
      "guides/offline-first-with-service-workers"
    ]
  ],
  "oro:fs": [
    [
      "Files and sandboxing",
      "guides/files-and-sandboxing"
    ],
    [
      "Project layout",
      "guides/project-layout"
    ]
  ],
  "oro:hooks": [
    [
      "Lifecycle hooks and deep links",
      "guides/lifecycle-hooks-and-deep-links"
    ],
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ]
  ],
  "oro:http": [
    [
      "Calling HTTP APIs",
      "guides/calling-http-apis"
    ]
  ],
  "oro:https": [
    [
      "Calling HTTP APIs",
      "guides/calling-http-apis"
    ]
  ],
  "oro:ipc": [
    [
      "Native extensions",
      "guides/native-extensions"
    ],
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ]
  ],
  "oro:location": [
    [
      "Lifecycle hooks and deep links",
      "guides/lifecycle-hooks-and-deep-links"
    ]
  ],
  "oro:mcp": [
    [
      "MCP and agent automation",
      "guides/mcp-and-agent-automation"
    ]
  ],
  "oro:navigation": [
    [
      "Lifecycle hooks and deep links",
      "guides/lifecycle-hooks-and-deep-links"
    ],
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ]
  ],
  "oro:notification": [
    [
      "Desktop integrations",
      "guides/desktop-integrations"
    ],
    [
      "Lifecycle hooks and deep links",
      "guides/lifecycle-hooks-and-deep-links"
    ]
  ],
  "oro:path": [
    [
      "Files and sandboxing",
      "guides/files-and-sandboxing"
    ],
    [
      "Project layout",
      "guides/project-layout"
    ]
  ],
  "oro:process": [
    [
      "Configure your runtime project",
      "guides/configure-your-runtime-project"
    ]
  ],
  "oro:protocol-handlers": [
    [
      "Custom protocols and routing",
      "guides/custom-protocols-and-routing"
    ],
    [
      "Offline-first with service workers",
      "guides/offline-first-with-service-workers"
    ]
  ],
  "oro:secure-storage": [
    [
      "Secure storage and sessions",
      "guides/secure-storage-and-sessions"
    ]
  ],
  "oro:service-worker": [
    [
      "Offline-first with service workers",
      "guides/offline-first-with-service-workers"
    ],
    [
      "Custom protocols and routing",
      "guides/custom-protocols-and-routing"
    ]
  ],
  "oro:shared-worker": [
    [
      "Shared workers across windows",
      "guides/shared-workers-across-windows"
    ],
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ]
  ],
  "oro:sqlite": [
    [
      "Local data with SQLite",
      "guides/local-data-with-sqlite"
    ],
    [
      "Files and sandboxing",
      "guides/files-and-sandboxing"
    ]
  ],
  "oro:test": [
    [
      "Testing and diagnostics",
      "guides/testing-and-diagnostics"
    ]
  ],
  "oro:worker": [
    [
      "Worker threads for heavy work",
      "guides/worker-threads-for-heavy-work"
    ],
    [
      "Shared workers across windows",
      "guides/shared-workers-across-windows"
    ]
  ],
  "oro:worker_threads": [
    [
      "Worker threads for heavy work",
      "guides/worker-threads-for-heavy-work"
    ]
  ],
  "oro:window": [
    [
      "Windows and messaging",
      "guides/windows-and-messaging"
    ],
    [
      "Desktop integrations",
      "guides/desktop-integrations"
    ]
  ]
}
export const DEFAULT_SEE_ALSO: readonly (readonly [string, string])[] = [
  [
    "JavaScript APIs overview",
    "javascript/overview"
  ],
  [
    "All module specifiers",
    "javascript/all-modules"
  ]
]
