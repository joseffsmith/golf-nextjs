import cheerio from 'cheerio'
import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()


const getUsers = (content: string): {ms_id: string, name: string}[] => {
  const $ = cheerio.load(content)
  const options = $('option')

  const vals = Array.from(options).map(o => {
    return {
      ms_id: $(o).attr('value').trim(),
      name: $(o).text().trim(),
    }
  })

  return vals.filter(v => !!v.ms_id)
}

export const getAllUsers = async (): Promise<{ms_id: string, name: string}[]> => {
  const base_url = process.env.BASE_URL
  const resp = await axios.get(base_url)

  fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/users.html', resp.data, err => console.error(err))
  return getUsers(resp.data)
}

export const getAllUsersLocal = async () => {
  const data = fs.readFileSync('/home/vagrant/golf-nextjs/debug_pages/users.html', 'utf8')
  return getUsers(data)
}
