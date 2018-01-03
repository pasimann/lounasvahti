import axios from 'axios'

import * as _ from 'lodash'
import * as moment from 'moment'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'
import { getFinnishDayName } from 'lounasvahti/utils'

export class Wanha extends Place {
  public header: string = 'Wanhassa Asemaravintolassa:'
  private url: string = 'http://vanhaasemaravintola.fi/lounaslista/'

  public menu (date: Date): Promise<string[]> {
    if (getFinnishDayName(date)) {
      const bounds: (string | undefined)[] = [
        getFinnishDayName(date),
        getFinnishDayName(moment(date).add(1, 'day').toDate())
      ]
      return Promise.resolve(axios.get(this.url)).then((response) => {
        const $: CheerioStatic = load(response.data)
        // First we find the weekday that we're currently taking a look at and then we take until
        // we encounter another week day.
        return _.chain($('.middlecontent p').toArray())
          .dropWhile(el => !$(el).find('strong').text().toLowerCase().includes(bounds[0] as string))
          .takeWhile(el => !$(el).find('strong').text().toLowerCase().includes(bounds[1] as string))
          .map(el => $(el).text())
          .join()
          .split('\n')
          .tail()
          .value()
      })
    }
    return Promise.resolve([])
  }
}
