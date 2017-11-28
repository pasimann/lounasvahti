const moment = require('moment')

const EDIBLES_REGEX = [
  /pi(ts|zz)a/i,
  /itse\s?tehty/i,
  /wien\w*\s*(leike|leikkeet)?/i,
  /kiev\w*\s*kana/i,
  /porsaan(leike|leikkeit)/i
]

module.exports.getEdibleReply = function getEdibleReply (date) {
  if (moment(date).isValid) {
    const y = moment(date).get('year')
    const d = moment(date).get('date')
    const m = moment(date).get('month') + 1
    return global.fetch(`https://www.sodexo.fi/ruokalistat/output/daily_json/66/${y}/${m}/${d}/fi`)
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        return response.courses
          .filter(course => !!EDIBLES_REGEX.find(re => re.test(course.title_fi)))
          .map(edible => edible.title_fi)
      })
      .then((edibles) => {
        if (edibles.length > 0) {
          return `Valtakunnanjohtaja Siitoin suosittelee:\n\n${edibles.join('\n')}`
        }
        return fetchRandomPekkaQuote()
      })
  }
  return Promise.reject(new Error(`Invalid date: ${date}`))
}

function fetchRandomPekkaQuote () {
  const s = moment().second();
  if (s % 2 === 0) {
    return Promise.resolve('Saatana elää ja voi hyvin.')
  }
  if (s % 3 === 0) {
    return Promise.resolve('Mmmm, mutta kaikesta huolimatta. Olen kivenkova rasisti, sadisti ja fasisti. Siitä minä nautin!')
  }
  if (s % 5 === 0) {
    return Promise.resolve('En missään tapauksessa ole mikään natsipelle, vaikka näin kommunistit väittääkin.')
  }
  if (s % 7 === 0) {
    return Promise.resolve('Magnumit on täällä aina valmiina.')
  }
  if (s % 11 === 0) {
    return Promise.resolve('Irstailija olen kyllä. Olen perverssi. Äitini toivoi minusta teologia, mutta minusta tulikin rivologi.')
  }
}
