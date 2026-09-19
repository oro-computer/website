import type { DataDeps, TemplateFunction } from '@domstack/static/types.js'
import type { BlogData } from '#lib/blog.ts'
import { atomFeed } from '#lib/blog-feeds.ts'
export const dataDeps = ['blogFeed'] satisfies DataDeps<Pick<BlogData, 'blogFeed'>>
const template: TemplateFunction<{ siteUrl: string }, Pick<BlogData, 'blogFeed'>> = ({ data, vars }) => atomFeed(data.blogFeed, vars.siteUrl)
export default template
