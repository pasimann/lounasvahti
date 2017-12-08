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

const slack = new SlackClient(SLACK_CLIENT_OPTIONS)

slack.initialize()
  .then(() => {
    slack.on(SlackClient.MESSAGE, (message: SlackMessage) => {
      log.info(message.content)

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
  const place: Place = new Sodexo()
  place.menu(date)
    .then((menu: string[]) => {
      log.info('Fetched Sodexo menu:', menu)
      slack.post(menu.join('\n'))
    })
    .catch((err: Error) => log.error(err.message, err.stack))
}
