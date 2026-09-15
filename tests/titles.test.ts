import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plainTitle, titleFromMarkdown } from '#lib/titles.ts'

test('plainTitle preserves visible inline text without Markdown or HTML markup', () => {
  for (const [inline, expected] of [
    ['[linked `code`](https://example.com)', 'linked code'],
    ['**Bold** and *emphasis* with `code`', 'Bold and emphasis with code'],
    ['Fish &amp; chips &#x2014; &lt;tag&gt;', 'Fish & chips — <tag>'],
    ['![Image **label**](image.png) and ![](empty.png)', 'Image label and'],
    ['<span>HTML <em>title</em></span> <!-- hidden -->', 'HTML title'],
    ['  Multiple\n spaces\tand &nbsp; gaps  ', 'Multiple spaces and gaps'],
    ['', ''],
  ]) assert.equal(plainTitle(inline), expected, inline)
})

test('titleFromMarkdown uses the first real H1 and ignores fenced headings', () => {
  assert.equal(titleFromMarkdown('```md\n# Not a title\n```\n\n~~~\n# Also fenced\n~~~\n\n## Subtitle\n\n# [Real `title`](https://example.com) &amp; **more**\n\n# Later'), 'Real title & more')
  assert.equal(titleFromMarkdown('Setext *title*\n===\n'), 'Setext title')
  assert.equal(titleFromMarkdown('## Only a subtitle\n\n```md\n# Fenced\n```'), '')
  assert.equal(titleFromMarkdown('Body without a heading.'), '')
  assert.equal(titleFromMarkdown(''), '')
})
