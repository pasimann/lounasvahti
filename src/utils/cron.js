const { CronJob } = require('cron')

const CRON_PATTERN = '30 7 * * 1-5'

module.exports.createCronJob = function createCronJob (onTick) {
  return new Promise((resolve, reject) => {
    try {
      resolve(new CronJob(CRON_PATTERN, () => onTick(new Date())))
    } catch (err) {
      return reject(err)
    }
  })
}
