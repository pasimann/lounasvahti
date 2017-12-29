import axios from 'axios'

import * as _ from 'lodash'
import * as moment from 'moment'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'

export class Shalimar extends Place {
  private static FINNISH_WEEKDAYS: string[] = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai'
  ]
  public header: string = 'Shalimar tarjoaa:'

  /**
   * @todo Still need to map the dish name and description together.
   */
  public menu (date: Date): Promise<string[]> {
    // Note that the the ISO weekday is 1-7 while our weekdays are 0-4.
    const currentWeekDayNumber = moment(date).isoWeekday()
    if (currentWeekDayNumber > Shalimar.FINNISH_WEEKDAYS.length) {
      return Promise.resolve([])
    }
    const nameOfToday = _.nth(Shalimar.FINNISH_WEEKDAYS, currentWeekDayNumber - 1)
    const nameOfTomorrow = _.nth(Shalimar.FINNISH_WEEKDAYS, currentWeekDayNumber)
    return Promise.resolve(axios.get('http://www.ravintolashalimar.fi/index.php?page=lounasjkl'))
      .then((response) => {
        const $: CheerioStatic = load(response.data)
        // First we find the weekday that we're currently taking a look at and then we take until
        // we encounter another week day.
        return _.chain($('table td').toArray().map((el: CheerioElement) => $(el).text()))
          .dropWhile((text: string) => !text.includes(nameOfToday as string))
          .takeWhile((text: string) => !text.includes(nameOfTomorrow as string))
          .tail()
          .filter((text: string) => text.trim().length > 0 && !text.includes('€'))
          .value()
      })
  }
}
