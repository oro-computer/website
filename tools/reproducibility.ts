import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
async function snapshot(root: string): Promise<Record<string, string>> {
  const files = await readdir(root, { recursive: true, withFileTypes: true })
  const result: Record<string, string> = {}
  for (const file of files)
    if (file.isFile()) {
      const path = join(file.parentPath, file.name)
      result[path] = createHash('sha256')
        .update(await readFile(path))
        .digest('hex')
    }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)))
}
const source = await snapshot('src')
const first = await snapshot('public')
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' })
const second = await snapshot('public')
const after = await snapshot('src')
if (JSON.stringify(first) !== JSON.stringify(second))
  throw new Error('Build output is not reproducible')
if (JSON.stringify(source) !== JSON.stringify(after))
  throw new Error('Build mutated its sources')
console.log('PASS: identical build output; no source changes.')
