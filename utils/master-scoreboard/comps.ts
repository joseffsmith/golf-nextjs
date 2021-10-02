import cheerio from 'cheerio'
import parse from 'date-fns/parse'
import { zonedTimeToUtc } from 'date-fns-tz'
import dotenv from 'dotenv'
import fs from 'fs'
import { auth } from './auth'

dotenv.config()

const COMP_URL = process.env.COMP_URL

export const getComps = async () => {
  const api = await auth()
  const comp_page = await api.get(COMP_URL)
  const comps = parseComps(comp_page.data)
  // const comps = parseComps(fs.readFileSync('/home/vagrant/golf-nextjs/debug_pages/comps.html', 'utf-8'))
  console.log(comps)
  return comps
}

const parseComps = (content: string): {comp_date: Date, description: string, book_from: Date | null, action: string | null}[] => {
  fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/comps.html', content, err => console.error(err))

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

    return {comp_date: parsed_date, description: raw_description, book_from, action}
  })
}
