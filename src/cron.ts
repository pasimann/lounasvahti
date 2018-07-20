import { CronJob } from 'cron'
import * as moment from 'moment-timezone'

export type CronJob = CronJob
export type CronTickHandler = (Date) => void

export function createCronJob (pattern: string, onTick: CronTickHandler): Promise<CronJob> {
  return new Promise((resolve, reject) => {
    try {
      return resolve(new CronJob(pattern, () => onTick(moment.tz('Europe/Helsinki'))))
    } catch (err) {
      return reject(err)
    }
  })
}
