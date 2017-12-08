import { CronJob } from 'cron'

export type CronJob = CronJob
export type CronTickHandler = (Date) => void

export function createCronJob (pattern: string, onTick: CronTickHandler): Promise<CronJob> {
  return new Promise((resolve, reject) => {
    try {
      return resolve(new CronJob(pattern, () => onTick(new Date())))
    } catch (err) {
      return reject(err)
    }
  })
}
