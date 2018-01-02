import axios from 'axios'

import * as _ from 'lodash'
import * as moment from 'moment'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'
import { getFinnishDayName } from 'lounasvahti/utils'

export class Shalimar extends Place {
  public header: string = 'Shalimar tarjoaa:'
  private url: string = 'http://www.ravintolashalimar.fi/index.php?page=lounasjkl'

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
        return Promise.resolve(_.chain($('table tr').toArray())
          .dropWhile(el => !$(el).find('td').text().toLowerCase().includes(bounds[0] as string))
          .takeWhile(el => !$(el).find('td').text().toLowerCase().includes(bounds[1] as string))
          .tail()
          .filter(el => $(el).find('td').text().trim().length > 0)
          .reduce((menu: string[], el: CheerioElement) => {
            if ($(el).find('td').hasClass('dish')) {
              const dish = $(el).find('td').first().text()
              const desc = $(el).next().find('td.desc').text()
              return desc !== null
                ? menu.concat(`${dish} - ${desc}`)
                : menu.concat(dish)
            }
            return menu
          }, [])
          .value())
      })
    }
    return Promise.resolve([])
  }
}
