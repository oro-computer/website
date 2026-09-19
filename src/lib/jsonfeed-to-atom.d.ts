declare module 'jsonfeed-to-atom' {
  interface Author {
    name: string
    url?: string
  }

  interface Feed {
    version: 'https://jsonfeed.org/version/1'
    title: string
    feed_url: string
    home_page_url?: string
    items: {
      id: string
      url: string
      title: string
      summary?: string
      content_html: string
      date_published: string
      date_modified?: string
      author?: Author
    }[]
  }

  export default function jsonfeedToAtom(
    feed: Feed,
    options?: { feedURLFn?: (feedUrl: string, feed: Feed) => string },
  ): string
}
