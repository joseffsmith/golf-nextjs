import { CronJob } from "quirrel/next"
import { saveComps } from 'utils/master-scoreboard/comps'

export default CronJob(
  "api/scrape-comps", // 👈 the route that it's reachable on
  ["40 8 * * *", 'Europe/London'],// https://crontab.guru/
  async () => {
    await saveComps()
  }
)
