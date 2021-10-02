import cheerio from 'cheerio'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

dotenv.config()

const BASE_URL = process.env.BASE_URL

// todo pass in username and password
const USERNAME = process.env.MS_USERNAME
const PASSWORD = process.env.MS_PASSWORD


export const auth = async (username: string = USERNAME, password: string = PASSWORD): Promise<AxiosInstance> => {
  const instance = wrapper(axios.create({
    jar: new CookieJar(),
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded'
    }
  }))

  const login = await instance.get(BASE_URL)

  const param = getLoginParam(login.data)

  const payload = new URLSearchParams();
  payload.append('ms_password', password);
  payload.append('ms_uniqueid', username);
  payload.append('Params', param)

  const resp: AxiosResponse = await instance.post(BASE_URL, payload,)

  checkLogin(resp.data, resp.headers)
  return instance
}

const getLoginParam = (content: string) => {
  const $ = cheerio.load(content)

  fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/login.html', content, err => console.error(err))

  return $('[name=Params]').attr('value')
}

const checkLogin = (content: string, headers: AxiosResponse['headers']) => {
  const $ = cheerio.load(content)
  const a = $('h1:contains("Restricted Access")')
  if (a.length) {
    fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/login_failed.json', JSON.stringify({data: content, headers: headers}), err => console.error(err))
    throw Error("Login failed")
  }
  fs.writeFile('/home/vagrant/golf-nextjs/debug_pages/login_success.json', JSON.stringify({data: content, headers: headers}), err => console.error(err))
}
