import type { DataDeps, PagesForLayout } from '@domstack/static/types.js'
import type globalVars from '../globals/global.vars.ts'
import type {} from '../layouts/blog-index.layout.ts'
import type { BlogData } from '#lib/blog.ts'
import { blogIndex } from '../layouts/blog-index.ts'

type ArchiveData = Pick<BlogData, 'blogArchives'>
export const dataDeps = ['blogArchives'] satisfies DataDeps<ArchiveData>

const archives: PagesForLayout<
  'blog-index',
  { title: string; description: string },
  typeof globalVars,
  ArchiveData,
  Record<string, never>
> = ({ data }) =>
  data.blogArchives.map(archive => ({
    outputName: `${archive.year}/index.html`,
    vars: {
      layout: 'blog-index',
      title: `${archive.year} · Blog · Oro Computer`,
      description: `Posts from the ${archive.year} Oro Computer blog archive.`,
    },
    children: blogIndex(archive.posts, data.blogArchives, archive.year),
  }))

export default archives
