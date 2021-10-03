import cheerio from 'cheerio'
import parse from 'date-fns/parse'
import { zonedTimeToUtc } from 'date-fns-tz'
import dotenv from 'dotenv'
import fs from 'fs'
import { auth } from './auth'
import { prisma } from 'lib/prisma'

dotenv.config()

const COMP_URL = process.env.COMP_URL

export const saveComps = async () => {
  const api = await auth()
  process.stdout.write('authed\n\n')
  const comp_page = await api.get(COMP_URL)
  process.stdout.write('got comp page\n\n')
  const comps = parseComps(comp_page.data)
  process.stdout.write('got comps\n\n')
  // const comps = parseComps(fs.readFileSync('/home/vagrant/golf-nextjs/debug_pages/comps.html', 'utf-8'))

  const to_delete = await prisma.comp.deleteMany({
    where: {
      comp_date: {
        lt: new Date()
      }
    }
  })
  if (to_delete.count) {
    process.stdout.write(`deleted: ${to_delete.count}\n\n`)
  }

  process.stdout.write('updating comps\n\n')
  comps.forEach(async comp => {
    const res = await prisma.comp.findMany({
      where: {
        unique_id: comp.unique_id
      }
    })
    if (res[0] && !res[0].action && comp.action) {
      process.stdout.write('updating action\n\n')
      await prisma.comp.update({
        where: {
          unique_id: comp.unique_id
        },
        data: {
          action: comp.action
        }
      })
    }
  })

  process.stdout.write('creating comps\n\n')
  const created = await prisma.comp.createMany({
    data: comps,
    skipDuplicates: true
  })

  return comps
}

const parseComps = (content: string): {unique_id: string, comp_date: Date, description: string, book_from: Date | null, action: string | null}[] => {
  // fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/comps.html', content, err => console.error(err))

  const $ = cheerio.load(content)

  const rows = $('tr').slice(1)

  return Array.from(rows).map(row => {
    const tds = Array.from($(row).find('td'))
    const [_, raw_comp_date, raw_description, raw_book_from] = tds.map(td => $(td).text())

    const parsed_date = parse(raw_comp_date.split(' ').slice(1).join(' '), 'dd MMM yy', new Date())

    let book_from: Date | null = null
    if (raw_book_from.includes('Book from')) {
      const date_part = raw_book_from.split(' ').slice(3).join(' ')
      const timezone = 'Europe/London'
      const bf = parse(date_part, 'do MMMM H:m', new Date())
      const zoned_book_from = zonedTimeToUtc(bf, timezone)
      book_from = zoned_book_from
    }

    const action = $(row).find('form').attr('action') ?? null

    return {unique_id: `${parsed_date.toString()}-${raw_description}`, comp_date: parsed_date, description: raw_description, book_from, action}
  })
}
