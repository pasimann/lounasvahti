import axios from 'axios'

import * as _ from 'lodash'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'
import { getFinnishDayName } from 'lounasvahti/utils'

export class Wanha extends Place {
  public name: RegExp = /((w|v)anha|asema)/i
  public header: string = 'Wanhassa Asemaravintolassa:'

  private url: string = 'http://vanhaasemaravintola.fi/lounaslista/'

  public menu (date: Date): Promise<string[]> {
    if (getFinnishDayName(date)) {
      const pv: (string | undefined) = getFinnishDayName(date)
      return Promise.resolve(axios.get(this.url)).then((response) => {
        const $: CheerioStatic = load(response.data)
        // First we find the weekday that we're currently taking a look at and then we take that
        return _.chain($('.leftcolumn p').toArray())
          .dropWhile(el => !$(el).find('strong').text().toLowerCase().includes(pv as string))
          .take()
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
