const authors = {
  oro: { name: 'Oro Computer', url: 'https://oro.computer' },
  joe: { name: 'Joseph Werle', url: 'https://github.com/jwerle' },
  bret: { name: 'Bret Comnes', url: 'https://bret.io' },
} as const

export type AuthorId = keyof typeof authors

export function resolveBlogAuthor(value: unknown, source: string): { id: AuthorId; name: string; url: string } {
  const id = value === undefined ? 'oro' : value
  if (typeof id !== 'string' || !Object.hasOwn(authors, id))
    throw new Error(`${source}: unknown author ${String(id)} (expected oro, joe, or bret)`)
  return { id: id as AuthorId, ...authors[id as AuthorId] }
}
