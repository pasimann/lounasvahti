import { CronJob } from 'cron'
import * as moment from 'moment-timezone'

export type CronJob = CronJob
export type CronTickHandler = (Date) => void

export function createCronJob (params: { pattern: string, onTick: CronTickHandler}): Promise<CronJob> {
  return new Promise((resolve, reject) => {
    try {
      return resolve(new CronJob({
        cronTime: params.pattern,
        onTick: () => params.onTick(moment.tz('Europe/Helsinki')),
        start: true,
        timeZone: 'Europe/Helsinki',
        runOnInit: true
      }))
    } catch (err) {
      return reject(err)
    }
  })
}
