import { CronJob } from 'cron'
import * as moment from 'moment-timezone'

export type CronJob = CronJob
export type CronTickHandler = (Date, CronJob) => void

export function createCronJob (params: { pattern: string, onTick: CronTickHandler, start?: boolean, timeZone?: string, runOnInit?: boolean}): Promise<CronJob> {
  return new Promise((resolve, reject) => {
    try {
      return resolve(new CronJob({
        cronTime: params.pattern,
        onTick: function () {
          return params.onTick(moment.tz(params.timeZone || 'Europe/Helsinki'), this)
        },
        start: params.start || true,
        timeZone: params.timeZone || 'Europe/Helsinki',
        runOnInit: params.runOnInit || false
      }))
    } catch (err) {
      return reject(err)
    }
  })
}
