require('dotenv/config')
require('isomorphic-fetch')

const moment = require('moment')
const express = require('express')
const { CronJob } = require('cron')
const { WebClient } = require('@slack/client')

const EDIBLES_REGEX = [
  /pi(ts|zz)a/i,
  /itse\s?tehty/i,
  /wien\w*\s*(leike|leikkeet)?/i,
  /kiev\w*\s*kana/i,
  /porsaan(leike|leikkeit)/i
]
const slack = new WebClient(process.env.SLACK_API_TOKEN)

let job = null
try {
  job = new CronJob(process.env.CRON_PATTERN, () => {
    return getMenu(new Date())
      .then(filterEdibles)
      .then(postEdiblesToSlack)
      .then((message) => {
        console.log(`Posted the following message:\n${message}`)
      })
      .catch(console.error)
  })
} catch (err) {
  console.error(err)
  process.exit(1)
}

express()
  .get('/', (req, res) => res.json({ foo: 'bar' }))
  .listen(process.env.PORT, (err) => {
    if (err) {
      console.error(err)
      return process.exit(1)
    }
    job.start()
    console.log(`Listening...`)
  })

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

function filterEdibles (menu) {
  return Promise.resolve(
    menu.courses.filter(course => !!EDIBLES_REGEX.find(re => re.test(course.title_fi))))
}

function postEdiblesToSlack (edibles) {
  return new Promise((resolve, reject) => {
    const courses = edibles.map(edible => edible.title_fi).join('\n')
    const message = `Alakerrassa seuraavaa:\n\n${courses}`
    slack.chat.postMessage('lounascuckold', message, { as_user: 'pekka' }, (err) => {
      return err ? reject(err) : resolve(message)
    })
  })
}
