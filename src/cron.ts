import { CronJob } from 'cron'
import * as moment from 'moment-timezone'

export type CronJob = CronJob
export type CronTickHandler = (Date, CronJob) => void

let tmp

export function createCronJob (params: { pattern: string, onTick: CronTickHandler}): Promise<CronJob> {
  return new Promise((resolve, reject) => {
    try {
      return resolve(new CronJob({
        cronTime: params.pattern,
        //TODO: Timezone as a parameter
        onTick: function() { return params.onTick(moment.tz('Europe/Helsinki'), this)},
        start: true,
        timeZone: 'Europe/Helsinki',
      }))
    } catch (err) {
      return reject(err)
    }
  })
}
