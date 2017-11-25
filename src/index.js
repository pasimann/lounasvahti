require('dotenv/config')
require('isomorphic-fetch')

const { log } = require('./utils/logger')
const { createCronJob } = require('./utils/cron')
const { startRTM, onMessage, postMessage } = require('./utils/slack')
const { getEdibleReply } = require('./utils/edibles')

startRTM()
  .then(() => {
    log.info('Slack RTM started...')
    onMessage((rtm, message) => {
      const date = new Date()
      if (/(louna(s|ana|aksi)|ruo(ka|aksi|kana))/i.test(message.text)) {
        log.info('Replying to message...')
        if (/huomen/i.test(message.text)) {
          date.setDate(date.getDate() + 1)
        }
        getEdibleReply(date)
          .then(reply => rtm.sendMessage(reply, message.channel))
          .then(() => log.info('Replied to a message!'))
          .catch(err => log.error('Failed to reply to a message.', err))
      }
    })
    return createCronJob((currentDate) => {
      log.info('Running CronJob...')
      return getEdibleReply(currentDate)
        .then(msg => postMessage(msg))
        .then(() => log.info('Ran CronJob succesfully.'))
        .catch(err => log.error('Failed to run Cronjob:', err))
    })
  })
  .then((cron) => {
    cron.start()
    log.info('CronJob created...')
  })
  .catch((err) => {
    log.error('Error initializing the service:', err)
    return process.exit(1)
  })
