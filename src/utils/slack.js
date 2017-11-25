const { WebClient, RtmClient, RTM_EVENTS, CLIENT_EVENTS } = require('@slack/client')

const rtm = new RtmClient(process.env.SLACK_API_TOKEN)
const client = new WebClient(process.env.SLACK_API_TOKEN)

module.exports.startRTM = function startRTM () {
  return new Promise((resolve, reject) => {
    rtm.start()
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, () => resolve())
  })
}

module.exports.postMessage = function postMessage (message) {
  const user = process.env.SLACK_USER
  const channel = process.env.SLACK_TARGET_CHANNEL
  return new Promise((resolve, reject) => {
    client.chat.postMessage(channel, message, { as_user: user }, err => err ? reject(err) : resolve())
  })
}

module.exports.onMessage = function onMessage (listener) {
  rtm.on(RTM_EVENTS.MESSAGE, (message) => listener(rtm, message))
}
