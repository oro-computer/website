import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { load } from 'cheerio'
import { markdown } from '#lib/markdown.ts'

// Verify the actual published files, rather than a second set of fixtures.
// Requires an installed Silk toolchain with its standard library and native linker.
const workspace = await mkdtemp(join(tmpdir(), 'oro-learn-examples-'))
try {
  for (const [lesson, executable, expected, tests] of [
    ['getting-started', 'orders', 'Order total: 2900 cents', 2],
    ['language-tour', 'packing', 'Pack 3 boxes\nDelivery: standard', 3],
    ['modules-and-packages', 'receipt', 'Receipt: 2900 cents', 1],
    ['types-and-optionals', 'customer', 'Ada: ada@example.com\nSam: collect a printed receipt', 2],
    ['results-and-errors', 'shipping', 'Shipping: 500 cents', 3],
  ] as const) {
    const dir = join(workspace, lesson)
    const $ = load(markdown().render(await readFile(`src/silk/learn/${lesson}/page.md`, 'utf8')))
    const sources: string[] = []
    for (const heading of $('h3').toArray()) {
      const filename = $(heading).text()
      if (!/^(src\/[^\s]+\.slk|silk\.toml)$/.test(filename)) continue
      const code = $(heading).next('pre').find('code').text()
      assert.ok(code, `${lesson}: ${filename} must have a complete code block`)
      const target = join(dir, filename)
      await mkdir(dirname(target), { recursive: true })
      await writeFile(target, code)
      if (filename.endsWith('.slk')) sources.push(filename)
    }
    await mkdir(join(dir, 'build'))
    const run = (args: string[]) => execFileSync('silk', args, { cwd: dir, encoding: 'utf8', timeout: 60_000 })
    const inputs = lesson === 'modules-and-packages' ? ['--package', '.'] : sources
    run(['check', ...inputs])
    const tap = run(['test', ...inputs])
    assert.match(tap, new RegExp(`1\\.\\.${tests}\\b`))
    assert.doesNotMatch(tap, /^not ok/m)
    run(['build', ...inputs, ...(lesson === 'modules-and-packages' ? ['--package-target', 'receipt'] : []), '-o', `build/${executable}`])
    const args = lesson === 'results-and-errors' ? ['delivery'] : []
    assert.equal(execFileSync(join(dir, 'build', executable), args, { encoding: 'utf8' }).trim(), expected)
    if (lesson === 'results-and-errors') {
      assert.equal(execFileSync(join(dir, 'build', executable), ['pickup'], { encoding: 'utf8' }).trim(), 'Shipping: 0 cents')
      for (const [argv, code, output] of [
        [['drone'], 1, 'Choose pickup or delivery.'],
        [[], 2, 'Usage: shipping <pickup|delivery>'],
      ] as const) {
        let failed = false
        try { execFileSync(join(dir, 'build', executable), [...argv], { encoding: 'utf8' }) }
        catch (error) {
          const result = error as { status: number; stdout: string }
          assert.equal(result.status, code)
          assert.equal(result.stdout.trim(), output)
          failed = true
        }
        assert.ok(failed, `shipping ${argv.join(' ')} must fail`)
      }
    }
    console.log(`PASS ${lesson}: check, ${tests} tests, native build, expected output`)
  }
} finally {
  await rm(workspace, { recursive: true, force: true })
}
