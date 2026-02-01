'use server'

import prisma from '@/lib/prisma'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import puppeteer from 'puppeteer'
import { getField } from './getField'
import { getGrade } from './getGrade'
// @ts-ignore
import { getRVP } from './getRVP'

export async function exportToPdf(preparationId: string) {
  const preparation = await prisma.preparations.findUnique({ where: { id: preparationId } })
  if (!preparation) throw new Error('preparation not found')

  // Convert Markdown to HTML
  const markdownHtml = await remark().use(gfm).use(html).process(String(preparation.content))
  const fieldName = await getField(preparation.fieldId)
  const gradeName = await getGrade(preparation.gradeId)
  const RVPs = await Promise.all(
    preparation.RVPCodes.map(code => getRVP(code))
  )

  // Build full HTML page
  const htmlPage = `
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="../prose.css">
    </head>
    <body>
      <div class="prose">
        <h1>${preparation.name}</h1>
        <p><strong>Ročník:</strong> ${gradeName}</p>
        <p><strong>Předmět:</strong> ${fieldName}</p>
        ${preparation.goals ? `<p><strong>Cíle:</strong> ${preparation.goals}</p>` : ''}
        ${preparation.teachingAids ? `<p><strong>Pomůcky:</strong> ${preparation.teachingAids}</p>` : ''}
        <h2>Časy</h2>
        <p><strong>Celkový čas:</strong> ${preparation.totalTime} minut</p>
        <ul>
          ${(preparation.times as any[]).map(o => `<li>${o.subtheme} – ${o.time}</li>`).join('')}
        </ul>
        <h2>RVP</h2>
        <ul>
          ${(RVPs).map(o => `<li>${o}</li>`).join('')}
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
      'Content-Disposition': `attachment; filename="${preparation.name || 'preparation'}.pdf"`,
    },
  })
}
