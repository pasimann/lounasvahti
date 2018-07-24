import 'module-alias/register'
import 'source-map-support/register'
import 'dotenv/config'

import * as log from 'winston'

import { createCronJob, CronJob } from 'lounasvahti/cron'
import { SlackClient, SlackClientOptions, SlackMessage } from 'lounasvahti/slack'

import { Place } from 'lounasvahti/place'
import { Wanha } from 'lounasvahti/place/wanha'
import { Sodexo } from 'lounasvahti/place/sodexo'
import { Shalimar } from 'lounasvahti/place/shalimar'
import { Trattoria } from 'lounasvahti/place/trattoria'



const CRON_PATTERN = '*/3 * * * 1-5'
const CRON_PATTERN_DAILY_LISTS = '* * * * *'

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
        Promise.all((mentioned.length > 0 ? mentioned : places).map(p => display(date, p)))
          .catch(err => log.error(err.message, err.stack))
      }
    })
  })
  .then(() => {
    console.log('create original cron')
    return createCronJob({ pattern: CRON_PATTERN, onTick: onCronTickCheck })
  })
  .catch((err: Error) => {
    log.error(err.message, err.stack)
    process.exit(1)
  })

function onCronTickLunchList (date: Date, context: CronJob): void {
  console.log('listing lunches')
  console.log(this)
  Promise.all(places.map(p => display(date, p)))
    .catch((err: Error) => log.error(err.message, err.stack))
    context.stop()
}

function onCronTickCheck (date: Date, context?: CronJob): void {
  console.log('create lunch cron')
  createCronJob({ pattern: CRON_PATTERN_DAILY_LISTS, onTick: onCronTickLunchList })
}

function display (date: Date, place: Place): Promise<void> {
  return place.menu(date).then((menu: string[]) => {
    if (menu.length > 0) {
      return slack.post(`${place.header}\n${menu.map(course => `- ${course}`).join('\n')}`)
    }
  })
}
