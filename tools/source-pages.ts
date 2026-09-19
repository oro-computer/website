import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Collection } from '#lib/collections.ts'

export async function stageCollection(collection: Collection, dest: string, site: string): Promise<void> {
  const { exportCollection } = await import('./import-public.ts')
  await exportCollection(collection, dest, site)
}
export async function importCollection(collection: Collection, source: string, site: string): Promise<void> {
  const { importCollection: importPublicCollection } = await import('./import-public.ts')
  await importPublicCollection(collection, source, site)
}

// Python's text readers normalize universal newlines before editorial processing.
export async function readText(path: string): Promise<string> {
  return (await readFile(path, 'utf8')).replace(/\r\n?/g, '\n')
}
export async function writeTextIfChanged(path: string, text: string): Promise<boolean> {
  let previous: string | undefined
  try { previous = await readText(path) } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  if (previous === text) return false
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text)
  return true
}
export async function files(root: string): Promise<string[]> {
  try {
    const entries = await readdir(root, { recursive: true, withFileTypes: true })
    const paths: string[] = []
    for (const entry of entries) {
      const path = join(entry.parentPath, entry.name)
      if (entry.isFile()) paths.push(path)
      else if (entry.isSymbolicLink()) {
        try { if ((await stat(path)).isFile()) paths.push(path) } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        }
      }
    }
    return paths.sort()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}
export function splitLines(text: string): string[] {
  if (!text) return []
  const lines = text.split(/\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/)
  if (lines.at(-1) === '') lines.pop()
  return lines
}
export function preserveFences(text: string, transform: (text: string) => string): string {
  const fences: string[] = []
  const lines = text.match(/[^\n\r\v\f\x1c-\x1e\x85\u2028\u2029]*(?:\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029])|[^\n\r\v\f\x1c-\x1e\x85\u2028\u2029]+$/g) ?? []
  const protectedLines: string[] = []
  // Avoid interpreting authored text as one of our placeholders.
  let token = 'OROFENCE'
  while (text.includes(token)) token += 'X'
  for (let i = 0; i < lines.length;) {
    const opening = /^ {0,3}(`{3,}|~{3,})([^\n]*)/.exec(lines[i])
    if (!opening || (opening[1][0] === '`' && opening[2].includes('`'))) {
      protectedLines.push(lines[i++]); continue
    }
    const start = i++
    const closing = new RegExp('^ {0,3}' + opening[1][0] + '{' + opening[1].length + ',}[ \\t]*$')
    while (i < lines.length) {
      if (closing.test(lines[i++].replace(/\n$/, ''))) break
    }
    fences.push(lines.slice(start, i).join(''))
    protectedLines.push(`${token}${fences.length - 1}END\n`)
  }
  return transform(protectedLines.join('')).replace(new RegExp(token + '(\\d+)END\\n?', 'g'), (_, index) => fences[Number(index)])
}
