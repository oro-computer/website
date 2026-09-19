import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { BlogData } from '#lib/blog.ts'
import { jsonFeed } from '#lib/blog-feeds.ts'
export const dataDeps = ['blogFeed'] satisfies DataDeps<Pick<BlogData, 'blogFeed'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<BlogData, 'blogFeed'>> = ({ data, vars }) => jsonFeed(data.blogFeed, vars.siteUrl)
export default template
