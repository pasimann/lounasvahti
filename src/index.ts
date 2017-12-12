import 'module-alias/register'
import 'source-map-support/register'
import 'dotenv/config'

import * as log from 'winston'

import { createCronJob, CronJob } from 'lounasvahti/cron'
import { SlackClient, SlackClientOptions, SlackMessage } from 'lounasvahti/slack'

import { Place } from 'lounasvahti/place'
import { Sodexo } from 'lounasvahti/place/sodexo'

const CRON_PATTERN = '* * * * *'

const SLACK_CLIENT_OPTIONS: SlackClientOptions = {
  user: process.env.SLACK_USER,
  channel: process.env.SLACK_CHANNEL,
  token: process.env.SLACK_API_TOKEN
}

const RE_TOMORROW = /huomen/i
const RE_SHOULD_REPLY = /(louna(s|ana|aksi)|ruo(ka|aksi|kana))/i

const slack = new SlackClient(SLACK_CLIENT_OPTIONS)

const places: Place[] = [
  new Sodexo()
]

slack.initialize()
  .then(() => {
    slack.on(SlackClient.MESSAGE, (message: SlackMessage) => {
      if (RE_SHOULD_REPLY.test(message.content)) {
        const date = new Date()
        if (RE_TOMORROW.test(message.content)) {
          date.setDate(date.getDate() + 1)
        }
        Promise.all(places.map(p => display(date, p)))
          .catch(err => log.error(err.message, err.stack))
      }
    })
  })
  .then(() => {
    return createCronJob(CRON_PATTERN, onCronTick).then((cron: CronJob) => cron.start())
  })
  .catch((err: Error) => {
    log.error(err.message, err.stack)
    process.exit(1)
  })

function onCronTick (date: Date): void {
  Promise.all(places.map(p => display(date, p)))
    .catch((err: Error) => log.error(err.message, err.stack))
}

function display (date: Date, place: Place): Promise<void> {
  return place.menu(date).then((menu: string[]) => {
    return slack.post(`${place.header}\n${menu.map(course => `- ${course}`).join('\n')}`)
  })
}