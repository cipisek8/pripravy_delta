'use server'

import prisma from '@/lib/prisma'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import puppeteer from 'puppeteer'
import { getField } from './getField'

const tailwindProseCSS = `
.prose { max-width: 65ch; margin: 0 auto; font-size: 16px; line-height: 1.75; color: #111; }
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 { color: #1e40af; margin-top: 1.5em; margin-bottom: 0.5em; }
.prose p { margin-bottom: 1em; }
.prose ul, .prose ol { padding-left: 1.5em; margin-bottom: 1em; }
.prose li { margin-bottom: 0.5em; }
.prose code { background-color: #f3f3f3; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
.prose pre { background-color: #f3f3f3; padding: 1em; border-radius: 4px; overflow-x: auto; }
.prose table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
.prose th, .prose td { border: 1px solid #ccc; padding: 6px; }
`

export async function exportToPdf(preparationId: string) {
  const preparation = await prisma.preparations.findUnique({ where: { id: preparationId } })
  if (!preparation) throw new Error('preparation not found')

  // Convert Markdown to HTML
  const markdownHtml = await remark().use(gfm).use(html).process(String(preparation.content))
  const fieldName = await getField(preparation.fieldId)

  // Build full HTML page
  const htmlPage = `
  <html>
    <head>
      <meta charset="utf-8">
      <style>${tailwindProseCSS}</style>
    </head>
    <body>
      <div class="prose">
        <h1>${preparation.theme}</h1>
        <p><strong>Ročník:</strong> ${preparation.year}</p>
        <p><strong>Předmět:</strong> ${fieldName}</p>
        ${preparation.goals ? `<p><strong>Cíle:</strong> ${preparation.goals}</p>` : ''}
        <h2>Časy</h2>
        <ul>
          ${(preparation.times as any[]).map(o => `<li>${o.subtheme} – ${o.time}</li>`).join('')}
        </ul>
        <hr/>
        <div>${markdownHtml.toString()}</div>
      </div>
    </body>
  </html>
  `

 const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(htmlPage, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  return new Response(pdfBuffer as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${preparation.theme || 'preparation'}.pdf"`,
    },
  })
}
