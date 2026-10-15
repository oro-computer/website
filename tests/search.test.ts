import { test } from 'node:test'
import assert from 'node:assert/strict'
import { prepareSearch, searchPages, type SearchEntry } from '../src/lib/search.ts'

const entry = (title: string, text = '', section = 'Silk Docs'): SearchEntry => ({ url: '/' + title.replaceAll(' ', '-') + '/', title, text, section, summary: '' })

test('site search ranks exact titles, title phrases, and body matches in order', () => {
  const index = prepareSearch([entry('Networking', 'Filesystem'), entry('Filesystem guide'), entry('Filesystem')])
  assert.deepEqual(searchPages(index, 'FILESYSTEM').map(item => item.title), ['Filesystem', 'Filesystem guide', 'Networking'])
  assert.deepEqual(searchPages(index, ' filesystem   guide ').map(item => item.title), ['Filesystem guide'])
  assert.deepEqual(searchPages(index, ''), [])
  assert.deepEqual(searchPages(index, 'no-such-term'), [])
  assert.equal(searchPages(index, 'filesystem', 1).length, 1)
})

test('site search requires every term and supports collection and full-text matches', () => {
  const index = prepareSearch([entry('Processes', 'Spawn a child process', 'Runtime Docs'), entry('Processes', 'Start a task')])
  assert.equal(searchPages(index, 'runtime spawn')[0]?.section, 'Runtime Docs')
  assert.equal(searchPages(index, 'silk spawn').length, 0)
  assert.equal(searchPages(index, '[.*').length, 0)
  const scoped = prepareSearch([entry('Silk ABI', 'Memory model'), entry('Memory model', 'Allocation')])
  assert.equal(searchPages(scoped, 'silk memory')[0]?.title, 'Memory model')
})

test('site search rejects nonlocal URLs and malformed entries', () => {
  const good = entry('Safe')
  const items = [good, ...['//evil.test/', 'javascript:alert(1)', '/\\evil.test/', '/bad path/'].map(url => ({ ...good, url }))]
  assert.deepEqual(prepareSearch(items).map(result => result.item), [good])
})
