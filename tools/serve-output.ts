import { createServer } from 'node:http'
import { readFile, realpath, stat } from 'node:fs/promises'
import { extname, isAbsolute, join, relative, resolve } from 'node:path'

// Serve the already-validated artifact, without rebuilding it or injecting a client.
const root = await realpath(resolve('public'))
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}
function insideRoot(path: string): boolean {
  const rel = relative(root, path)
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith('../')
}
const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1:9877')
    const pathname = decodeURIComponent(url.pathname)
    let path = await realpath(resolve(root, '.' + pathname))
    if (!insideRoot(path)) {
      res.writeHead(403).end()
      return
    }
    if ((await stat(path)).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: url.pathname + '/' + url.search }).end()
        return
      }
      path = await realpath(join(path, 'index.html'))
    }
    if (!insideRoot(path)) {
      res.writeHead(403).end()
      return
    }
    const body = await readFile(path)
    res.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    })
    res.end(req.method === 'HEAD' ? undefined : body)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    res.writeHead(error instanceof URIError ? 400 : code === 'ENOENT' || code === 'ENOTDIR' ? 404 : 500).end()
  }
})
server.listen(9877, '127.0.0.1', () => console.log('Serving public/ at http://127.0.0.1:9877'))
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => server.close())
