import cheerio from 'cheerio'
import chunk from 'lodash/chunk'
import parse from 'date-fns/parse'

// export const parseDate = (date: string): { startsAt: Date, endsAt: Date } => {
//   const parts = date
//     .replace('\n', ' ')
//     .split(' - ')
//     .map((date) => parse(date.split(' ')[1], 'dd/MM/yy', new Date()))

//   return { startsAt: parts[0], endsAt: parts[1] || parts[0] }
// }

const getUsers = ($: cheerio.Root): User[] => {

  const users = []
  return users
}
