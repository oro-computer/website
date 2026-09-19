import { markdown } from '#lib/markdown.ts'
// DOMStack accepts a factory returning a fully configured MarkdownIt instance.
// A fresh instance keeps heading-ID state page-local and bypasses default plugins.
export default markdown
