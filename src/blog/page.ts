import type { DataDeps, PageFunction } from '@domstack/static/types.js'
import type { BlogData } from '#lib/blog.ts'
import { blogIndex } from '../layouts/blog-index.ts'

export const vars = {
  layout: 'blog-index',
  title: 'Blog · Oro Computer',
  description:
    'Notes from Oro Computer on building native applications with web technologies.',
  dataDeps: ['blogPosts', 'blogArchives'] satisfies DataDeps<
    Pick<BlogData, 'blogPosts' | 'blogArchives'>
  >,
}

const page: PageFunction<
  typeof vars,
  string,
  Pick<BlogData, 'blogPosts' | 'blogArchives'>
> = ({ data }) => blogIndex(data.blogPosts, data.blogArchives)

export default page
