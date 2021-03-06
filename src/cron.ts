import { CronJob } from 'cron'
import * as moment from 'moment-timezone'

export type CronJob = CronJob
export type CronDate = moment.Moment
export type CronTickHandler = (CronDate, CronJob) => void

export interface ICronJobParams {
  pattern: string,
  onTick: CronTickHandler,
  start?: boolean,
  timeZone?: string,
  runOnInit?: boolean
}

export async function createCronJob (params: ICronJobParams): Promise<CronJob> {
  return new CronJob({
    cronTime: params.pattern,
    onTick: function () {
      return params.onTick(moment.tz(params.timeZone || 'Europe/Helsinki'), this)
    },
    start: params.start || true,
    timeZone: params.timeZone || 'Europe/Helsinki',
    runOnInit: params.runOnInit || false
  })
}
