import 'module-alias/register'
import 'source-map-support/register'
import 'dotenv/config'

import * as log from 'winston'

import { createCronJob, CronJob, CronDate } from 'lounasvahti/cron'
import { SlackClient, SlackClientOptions, SlackMessage, IMessage } from 'lounasvahti/slack'

import { Place } from 'lounasvahti/place'
import { Wanha } from 'lounasvahti/place/wanha'
import { Sodexo } from 'lounasvahti/place/sodexo'
import { Shalimar } from 'lounasvahti/place/shalimar'
import { Trattoria } from 'lounasvahti/place/trattoria'

const CRON_PATTERN = '0 4 * * 1-5'
const CRON_PATTERN_DAILY_LISTS = '30 8 * * 1-5'

const SLACK_CLIENT_OPTIONS: SlackClientOptions = {
  user: process.env.SLACK_USER || '',
  channel: process.env.SLACK_CHANNEL || '',
  token: process.env.SLACK_API_TOKEN || ''
}

const RE_TOMORROW = /huomen/i
const RE_SHOULD_REPLY = /(louna(s|ana|aksi)|ruo(ka|aksi|kana))/i

const slack = new SlackClient(SLACK_CLIENT_OPTIONS)

const places: Place[] = [
  new Wanha(),
  new Sodexo(),
  new Shalimar(),
  new Trattoria()
]

slack.initialize()
  .then(() => {
    slack.on(SlackClient.MESSAGE, (message: SlackMessage) => {
      if (RE_SHOULD_REPLY.test(message.content)) {
        const date = new Date()
        if (RE_TOMORROW.test(message.content)) {
          date.setDate(date.getDate() + 1)
        }
        const mentioned = places.filter(place => place.name.test(message.content))
        Promise.all((mentioned.length > 0 ? mentioned : places).map((p: Place) => displayLunchLists(date, p, message.ts)))
          .catch((err: Error) => log.error(err.message, err.stack))
      }
    })
  })
  .then(() => {
    return createCronJob({ pattern: CRON_PATTERN, onTick: onCronTickCreateLunchCheck })
  })
  .catch((err: Error) => {
    log.error(err.message, err.stack)
    process.exit(1)
  })

async function onCronTickOneOffLunchList (date: CronDate, context: CronJob): Promise<void> {
  try {
    const message = await slack.post(`Päivän ${date.date()}.${date.month() + 1}. lounaat`)
    Promise.all(places.map((p: Place) => displayLunchLists(date, p, message.ts)))
  } catch (err) {
    log.error(err)
  }
  context.stop()
}

function onCronTickCreateLunchCheck (date: CronDate, context?: CronJob): void {
  createCronJob({ pattern: CRON_PATTERN_DAILY_LISTS, onTick: onCronTickOneOffLunchList })
  .catch((err: Error) => log.error(err.message, err.stack))
}

async function displayLunchLists (date: Date, place: Place, ts?: string): Promise<void> {
  const menu = await place.menu(date)
  if (menu.length > 0) {
    slack.post(`${place.header}\n${menu.map(course => `- ${course}`).join('\n')}`, ts)
  }
}
