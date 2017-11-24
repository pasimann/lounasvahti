require('dotenv/config')
require('isomorphic-fetch')

const moment = require('moment')
const { CronJob } = require('cron')
const { WebClient } = require('@slack/client')

/**
 * Handle to the Slack WebClient.
 */
const slack = new WebClient(process.env.SLACK_API_TOKEN)

/**
 * The job to run on each pattern tick.
 */
let job = null
try {
  job = new CronJob(process.env.CRON_PATTERN, () => {
    getMenu(new Date())
      .then((menu) => {
        return new Promise((resolve, reject) => {
          slack.chat.postMessage('tanelih', 'terve', { as_user: 'pekka' }, (err) => {
            if (err) {
              return reject(err)
            }
            return resolve()
          })
        })
      })
      .catch(console.error)
  })
} catch (err) {
  console.error(err)
  process.exit(1)
}

job.start()

/**
 * Get the menu.
 */
function getMenu (date) {
  if (moment(date).isValid) {
    const y = moment(date).get('year')
    const d = moment(date).get('date')
    const m = moment(date).get('month') + 1
    return global.fetch(`https://www.sodexo.fi/ruokalistat/output/daily_json/66/${y}/${m}/${d}/fi`)
      .then(response => response.json())
  }
  return Promise.reject(new Error(`Invalid date: ${date}`))
}
