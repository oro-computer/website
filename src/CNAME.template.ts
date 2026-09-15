import { readFile } from 'node:fs/promises'
// Keep the custom domain in the repository's canonical CNAME file.
export const dataDeps = []
export default () => readFile(new URL('../CNAME', import.meta.url), 'utf8')
