import type { PageData } from '@domstack/static/types.js'
import { plainTitle } from '#lib/titles.ts'
import { resolveBlogAuthor, type AuthorId } from '#lib/authors.ts'

export interface BlogPost {
  url: string
  title: string
  description: string
  publishDate: string
  updatedDate?: string
  authorName: string
  authorUrl?: string
  html: string
  draft?: boolean
}
export type BlogSummary = Omit<BlogPost, 'html'>
export interface BlogArchive {
  year: string
  url: string
  posts: BlogSummary[]
}
export interface BlogData {
  blogPosts: BlogSummary[]
  blogFeed: BlogPost[]
  blogArchives: BlogArchive[]
}

export function blogYear(url: string): string | undefined {
  return /^\/blog\/(\d{4})\//.exec(url)?.[1]
}
export type BlogPage = Pick<PageData<Record<string, unknown>, string>, 'sourceId' | 'vars' | 'renderInnerPage'> & {
  pageInfo: Pick<PageData<Record<string, unknown>, string>['pageInfo'], 'url' | 'type'>
}
export interface BlogPostVars {
  title: string
  description: string
  publishDate: string
  updatedDate?: string
  author?: AuthorId
}

export function blogDate(value: unknown, field: string, source: string): string {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!match) throw new Error(`${source}: ${field} must be an RFC 3339 timestamp with an explicit timezone`)
  const [, year, month, day, hour, minute, second, zone] = match
  const leap = +year % 4 === 0 && (+year % 100 !== 0 || +year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const time = Date.parse(value as string)
  if (+month < 1 || +month > 12 || +day < 1 || +day > days[+month - 1] || +hour > 23 || +minute > 59 || +second > 59 ||
    (zone !== 'Z' && (+zone.slice(1, 3) > 23 || +zone.slice(4) > 59 || zone === '-00:00')) || !Number.isFinite(time))
    throw new Error(`${source}: ${field} must be a valid timestamp with a known timezone`)
  return new Date(time).toISOString()
}

export function validateBlogVars(vars: Record<string, unknown>, source: string): Omit<BlogPost, 'url' | 'html' | 'draft'> {
  const title = typeof vars.title === 'string' ? plainTitle(vars.title) : ''
  if (!title) throw new Error(`${source}: title must contain visible text (supply an H1 or explicit title)`)
  if (typeof vars.description !== 'string' || !vars.description.trim()) throw new Error(`${source}: description must be a non-empty string`)
  const publishDate = blogDate(vars.publishDate, 'publishDate', source)
  const updatedDate = vars.updatedDate === undefined ? undefined : blogDate(vars.updatedDate, 'updatedDate', source)
  if (updatedDate && Date.parse(updatedDate) < Date.parse(publishDate)) throw new Error(`${source}: updatedDate must not precede publishDate`)
  const author = resolveBlogAuthor(vars.author, source)
  return { title, description: vars.description.trim(), publishDate, ...(updatedDate ? { updatedDate } : {}), authorName: author.name, authorUrl: author.url }
}

export async function readBlogPost(page: BlogPage): Promise<BlogPost> {
  if (page.pageInfo.type !== 'md') throw new Error(`${page.sourceId}: blog posts must be Markdown`)
  const metadata = validateBlogVars(page.vars, page.sourceId)
  return { ...metadata, url: page.pageInfo.url, html: await page.renderInnerPage(), draft: /\.draft\.md$/.test(page.sourceId) }
}

export function projectBlog(posts: readonly BlogPost[]): BlogData {
  const sorted = [...posts].sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate) || (a.url < b.url ? -1 : a.url > b.url ? 1 : 0))
  const blogPosts = sorted.map(({ html: _html, ...post }) => post)
  const years = new Map<string, BlogSummary[]>()
  for (const post of blogPosts) {
    const year = blogYear(post.url)
    if (!year) continue
    if (!years.has(year)) years.set(year, [])
    years.get(year)!.push(post)
  }
  return {
    blogPosts,
    blogFeed: sorted.filter(post => !post.draft).slice(0, 20),
    blogArchives: [...years].sort(([a], [b]) => b.localeCompare(a)).map(([year, posts]) => ({ year, url: `/blog/${year}/`, posts })),
  }
}

export function formatBlogDate(value: string): string {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(value))
}
