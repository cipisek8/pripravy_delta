'use server'

import gfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

export async function renderMarkdown(markdown: string) {
const result = await unified()
  .use(remarkParse)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeStringify)
  .use(gfm)
  .process(markdown);

  return String(result);
}
