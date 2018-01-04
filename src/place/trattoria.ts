import axios from 'axios'

import * as _ from 'lodash'
import * as moment from 'moment'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'
import { getFinnishDayName } from 'lounasvahti/utils'

export class Trattoria extends Place {
  public name: RegExp = /trattoria/i
  public header: string = 'Trattoriassa'

  private url: string = 'https://www.raflaamo.fi/fi/jyvaskyla/trattoria-aukio-jyvaskyla/menu'

  public menu (date: Date): Promise<string[]> {
    if (getFinnishDayName(date)) {
      const bounds: (string | undefined)[] = [
        getFinnishDayName(date),
        getFinnishDayName(moment(date).add(1, 'day').toDate())
      ]
      return Promise.resolve(axios.get(this.url)).then((response) => {
        const $: CheerioStatic = load(response.data)
        return _.chain($('.menu-detail__content').children().toArray())
          .dropWhile(el => ($(el).attr('id') || '').toLowerCase() !== bounds[0])
          .takeWhile(el => ($(el).attr('id') || '').toLowerCase() !== bounds[1])
          .filter((el) => $(el).hasClass('menu-detail__dish-list'))
          .first()
          .thru((el) => {
            return $(el).children().toArray().map((el) => {
              return $(el).find('.menu-detail__dish-name').text()
            })
          })
          .value()
      })
    }
    return Promise.resolve([])
  }
}
