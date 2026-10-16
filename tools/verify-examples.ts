import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
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

// Exercise the published input boundary and ensure removing a guard breaks its proof.
const formalWorkspace = await mkdtemp(join(tmpdir(), 'oro-formal-input-'))
try {
  const $ = load(markdown().render(await readFile('src/silk/docs/guides/formal-silk/page.md', 'utf8')))
  const source = $('code.language-silk').first().text()
  assert.ok(source.includes('fn try_withdraw'), 'The formal guide must contain the complete CLI example')
  const file = join(formalWorkspace, 'withdraw.slk')
  const executable = join(formalWorkspace, 'withdraw')
  await writeFile(file, source)
  const std = process.env.SILK_STD_ROOT ? ['--std-root', process.env.SILK_STD_ROOT] : []
  const run = (args: string[]) => execFileSync('silk', [...args, ...std], { cwd: formalWorkspace, encoding: 'utf8', timeout: 60_000 })
  run(['check', '--verify', file])
  run(['build', file, '-o', executable])
  for (const [args, status, output] of [
    [['2500'], 0, 'Remaining: 7500 cents'],
    [['0'], 0, 'Remaining: 10000 cents'],
    [['10000'], 0, 'Remaining: 0 cents'],
    [['-1'], 1, 'Amount must be between 0 and 10000 cents.'],
    [['10001'], 1, 'Amount must be between 0 and 10000 cents.'],
    [['hello'], 1, 'Enter a whole number of cents within the int range.'],
    [['2500oops'], 1, 'Enter a whole number of cents within the int range.'],
    [['9223372036854775808'], 1, 'Enter a whole number of cents within the int range.'],
    [[], 2, 'Usage: withdraw <amount-in-cents>'],
    [['1', '2'], 2, 'Usage: withdraw <amount-in-cents>'],
  ] as const) {
    const result = spawnSync(executable, [...args], { encoding: 'utf8' })
    assert.equal(result.status, status, args.join(' '))
    assert.equal(result.stdout.trim(), output, args.join(' '))
  }
  for (const replacement of ['', '#assert amount <= balance;']) {
    await writeFile(file, source.replace('if amount > balance { return -1; }', replacement))
    const result = spawnSync('silk', ['check', '--verify', file, ...std], { cwd: formalWorkspace, encoding: 'utf8' })
    assert.notEqual(result.status, 0, 'An unchecked external amount must fail verification')
    assert.match(result.stderr, /E3007|E3006/, 'Expect a proof failure at the call or assertion')
  }
  console.log('PASS Formal Silk: verified build, 10 CLI cases, missing guard and unproved assertion rejected')
  const tutorial = load(markdown().render(await readFile('src/silk/docs/usage/tutorials/07-formal-silk/page.md', 'utf8')))
  const tutorialBlocks = tutorial('code.language-silk').toArray()
  assert.equal(tutorialBlocks.length, 5)
  for (const [index, block] of tutorialBlocks.entries()) {
    const tutorialFile = join(formalWorkspace, `tutorial-${index + 1}.slk`)
    const tutorialExecutable = join(formalWorkspace, `tutorial-${index + 1}`)
    await writeFile(tutorialFile, tutorial(block).text())
    run(['check', '--verify', tutorialFile])
    run(['build', tutorialFile, '-o', tutorialExecutable])
    assert.equal(execFileSync(tutorialExecutable, [], { encoding: 'utf8' }).trim(), '')
  }
  console.log('PASS Formal Silk tutorial: 5 verified native programs, all exit successfully')
} finally {
  await rm(formalWorkspace, { recursive: true, force: true })
}
