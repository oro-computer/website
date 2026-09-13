import { readFile } from 'node:fs/promises'
// Keep the custom domain in the repository's canonical CNAME file.
export default async () => ({
  outputName: 'CNAME',
  content: await readFile(new URL('../CNAME', import.meta.url), 'utf8'),
})
