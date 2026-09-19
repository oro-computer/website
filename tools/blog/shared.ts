import { lstat, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface BlogOptions {
  blogDir?: string
  now?: Date
}

export const BLOG_DIR = fileURLToPath(new URL('../../src/blog/', import.meta.url))

export function context(options: BlogOptions) {
  const now = options.now ?? new Date()
  const iso = now.toISOString()
  return { blogDir: options.blogDir ?? BLOG_DIR, year: String(now.getUTCFullYear()), iso }
}

export function postParts(input: string, year: string): [string, string] {
  const match = /^(?:(\d{4})\/)?([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(input)
  if (!match) throw new Error('Use a lowercase slug or year/slug (for example, 2025/hello-world).')
  return [match[1] ?? year, match[2]!]
}

export async function directory(parent: string, name: string, create: boolean) {
  const path = join(parent, name)
  if (create) await mkdir(path, { recursive: false }).catch(error => {
    if (error.code !== 'EEXIST') throw error
  })
  const stat = await lstat(path)
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Blog paths must be directories, not symbolic links.')
  return path
}

export async function requireAbsent(path: string) {
  try {
    await lstat(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  throw new Error('Post already exists; nothing was overwritten.')
}

export function reportError(error: unknown) {
  const code = (error as NodeJS.ErrnoException).code
  const message = code === 'ENOENT' ? 'Draft or blog directory not found.'
    : code === 'EEXIST' ? 'Post already exists; nothing was overwritten.'
    : code ? `File operation failed (${code}).`
    : error instanceof Error ? error.message : 'Operation failed.'
  console.error(`Error: ${message}`)
  process.exitCode = 1
}
