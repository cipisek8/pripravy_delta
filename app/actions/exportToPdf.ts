'use server'

import prisma from '@/lib/prisma'
import { remark } from 'remark'
import html from 'remark-html'
import gfm from 'remark-gfm'
import chromium from '@sparticuz/chromium-min'
import puppeteerCore from 'puppeteer-core'
import { getField } from './getField'
import { getGrade } from './getGrade'
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

//TODO: i kody RVP
//TODO: PDF listy na konec
//TODO: obsah do jedne tabulky

  // Build full HTML page
  const htmlPage = `
  <html>
    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="../prose.css">
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
        th { background: #f6f6f6; text-align: left; width: 25%; }
      </style>
    </head>
    <body>
      <div class="prose">
        <h1>${preparation.name}</h1>
        <table>
          <tbody>
            <tr>
              <th>Ročník</th>
              <td>${gradeName}</td>
            </tr>
            <tr>
              <th>Předmět</th>
              <td>${fieldName}</td>
            </tr>
            ${
              preparation.goals
                ? `<tr><th>Cíle</th><td>${preparation.goals}</td></tr>`
                : ''
            }
            ${
              preparation.teachingAids
                ? `<tr><th>Pomůcky</th><td>${preparation.teachingAids}</td></tr>`
                : ''
            }
            <tr>
              <th>RVP</th>
              <td>
                <ul>
                  ${RVPs.map(o => `<li>${o}</li>`).join('')}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Časy</h2>
        <table>
          <tbody>
            <tr>
              <th>Celkový čas</th>
              <td>${preparation.totalTime} minut</td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Podtéma</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>
            ${(preparation.times as any[]) // eslint-disable-line @typescript-eslint/no-explicit-any
              .map(o => `<tr><td>${o.subtheme}</td><td>${o.time} minut</td></tr>`)
              .join('')}
          </tbody>
        </table>

        <hr/>
        <h2>Obsah lekce</h2>
        <div>${markdownHtml.toString()}</div>
      </div>
    </body>
  </html>
  `

  const isVercel = Boolean(process.env.VERCEL)
  const browser = isVercel
    ? await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    : await (await import('puppeteer')).default.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(htmlPage, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  return new Response(pdfBuffer as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${preparation.name || 'preparation'}.pdf"`,
    },
  })
}
