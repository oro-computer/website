import type { PageOutputsFunction } from '@domstack/static/types.js'
import { rawUrl, type DocVars } from './docs.ts'

export const pageOutputs: PageOutputsFunction<DocVars> = async ({ page, vars }) => ({
  outputName: rawUrl({ collection: vars.docsCollection, sourcePath: vars.sourcePath }),
  content: await page.readMarkdownContent(),
})
