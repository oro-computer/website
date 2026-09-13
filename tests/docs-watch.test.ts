import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, basename } from 'node:path'
import { identifyPages } from '@domstack/static/lib/identify-pages.js'
import { buildPagesDirect } from '@domstack/static/lib/build-pages/index.js'

test('DOMStack selectively rebuilds docs consumers for body and navigation edits', { timeout: 20000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'oro-docs-watch-'))
  const src = join(fixture, 'src')
  const dest = join(fixture, 'public')
  try {
    await mkdir(src)
    // Re-export real consumers so the fixture tests their actual subscriptions,
    // while keeping builds and edits isolated from the site's source/output.
    const proxy = async (target: string, source: string) => {
      const url = new URL('../src/' + source, import.meta.url).href
      await writeFile(join(src, target), `export { default } from ${JSON.stringify(url)}\nexport * from ${JSON.stringify(url)}\n`)
    }
    for (const name of ['global.data.ts', 'global.vars.ts', 'markdown-it.settings.ts']) await proxy(name, name)
    for (const name of ['root', 'docs', 'runtime-docs', 'silk-docs'])
      await proxy(name + '.layout.ts', 'layouts/' + name + '.layout.ts')
    for (const name of (await readdir(new URL('../src/', import.meta.url))).filter(name => name.endsWith('.template.ts') && name !== 'cname.template.ts'))
      await proxy(name, name)
    const pageSource = (collection: string, id: string, title: string, body: string) => `---
layout: "${collection}-docs"
title: "${title}"
description: "Summary"
docsCollection: "${collection}"
section: "overview"
order: ${id === 'start' ? 0 : 1}
sourcePath: "${id}.md"
githubRepo: "oro-computer/${collection}"
githubRef: "master"
---
# ${title}

## Stable anchor

${body}
`
    const pageFiles: string[] = []
    for (const [collection, id] of [['runtime', 'start'], ['runtime', 'next'], ['silk', 'start']]) {
      const dir = join(src, collection, 'docs', ...(id === 'start' ? [] : [id]))
      await mkdir(dir, { recursive: true })
      const path = join(dir, 'page.md')
      pageFiles.push(path)
      await writeFile(path, pageSource(collection, id, id, 'Original body'))
    }
    const siteData = await identifyPages(src)
    assert.deepEqual(siteData.errors, [])
    const first = await buildPagesDirect(src, dest, siteData, { trackWatchDependencies: true })
    assert.deepEqual(first.errors, [])
    const initial = first.report.watchDependencies!
    assert.ok(Object.values(initial.globalDataFingerprints).every(value => typeof value === 'string'))
    const subscription = Object.values(initial.consumers).find(c => c.key === pageFiles[0])!
    assert.deepEqual(subscription.globalDataKeys, ['runtimeNavigation'])
    const unchanged = await readFile(join(dest, 'runtime/docs/next/index.html'), 'utf8')
    const index = await readFile(join(dest, 'runtime/docs/index.json'), 'utf8')

    await writeFile(pageFiles[0], pageSource('runtime', 'start', 'start', 'Changed body'))
    const bodyEdit = await buildPagesDirect(src, dest, siteData, {
      trackWatchDependencies: true, previousWatchDependencies: initial,
      pageFilterPaths: [pageFiles[0]], templateFilterPaths: [], pagesFileFilterPaths: [],
    })
    assert.deepEqual(bodyEdit.errors, [])
    assert.deepEqual(bodyEdit.report.pages.map(p => p.sourcePageFilePath), [pageFiles[0]])
    assert.deepEqual(bodyEdit.report.templates.map(t => basename(t.templateInfo.templateFile.filepath)).sort(), [
      'runtime-llms.template.ts', 'runtime-search.template.ts', 'runtime-sources.template.ts',
    ])
    assert.equal(await readFile(join(dest, 'runtime/docs/next/index.html'), 'utf8'), unchanged)
    assert.equal(await readFile(join(dest, 'runtime/docs/index.json'), 'utf8'), index)
    assert.match(await readFile(join(dest, 'runtime/docs/search.json'), 'utf8'), /Changed body/)
    assert.match(await readFile(join(dest, 'runtime/docs/source/start.md'), 'utf8'), /Changed body/)
    assert.match(await readFile(join(dest, 'runtime/llms.txt'), 'utf8'), /Changed body/)
    assert.match(await readFile(join(dest, 'runtime/docs/index.html'), 'utf8'), /id="stable-anchor"/)

    await writeFile(pageFiles[0], pageSource('runtime', 'start', 'Renamed', 'Changed body'))
    const titleEdit = await buildPagesDirect(src, dest, siteData, {
      trackWatchDependencies: true, previousWatchDependencies: bodyEdit.report.watchDependencies,
      pageFilterPaths: [pageFiles[0]], templateFilterPaths: [], pagesFileFilterPaths: [],
    })
    assert.deepEqual(titleEdit.errors, [])
    assert.deepEqual(titleEdit.report.pages.map(p => p.sourcePageFilePath).sort(), pageFiles.slice(0, 2).sort())
    assert.deepEqual(titleEdit.report.templates.map(t => basename(t.templateInfo.templateFile.filepath)).sort(), [
      'runtime-index.template.ts', 'runtime-llms.template.ts', 'runtime-search.template.ts', 'runtime-sources.template.ts',
    ])
    assert.match(await readFile(join(dest, 'runtime/docs/next/index.html'), 'utf8'), /Renamed/)
  } finally {
    await rm(fixture, { recursive: true, force: true })
  }
})
