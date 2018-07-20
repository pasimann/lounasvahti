import axios from 'axios'

import * as _ from 'lodash'
import * as moment from 'moment'

import { load } from 'cheerio'
import { Place } from 'lounasvahti/place'
import { getFinnishDayName } from 'lounasvahti/utils'

export class Shalimar extends Place {
  public name: RegExp = /shalimar/i
  public header: string = 'Shalimarissa:'

  private url: string = 'http://www.ravintolashalimar.fi'

  public menu (date: Date): Promise<string[]> {
    const pv: (string | undefined) = getFinnishDayName(date)
    const vk: number = moment(date).week() % 4 === 0 ? 4 : moment(date).week() % 4
    return Promise.resolve(axios.get(this.url)).then((response) => {
      const $: CheerioStatic = load(response.data)
      // We find the weekday of the right week that we're currently taking a look at.
      // For monday and tuesday of week 1, there is no weeknumber, so we have to account for that. :)
      return Promise.resolve(_
        .chain($(`.fdm-section-${pv as string}, .fdm-section-${pv as string}-${vk}`).last().find('.fdm-item'))
        .reduce((menu: string[], el: CheerioElement) => {
          if ($(el).find('div').hasClass('fdm-item-panel')) {
            const dish = $(el).find('.fdm-item-title').text()
            const desc = $(el).find('.fdm-item-content > p').text()
            return menu.concat(`${dish} - ${desc}`)
          }
          return menu
        }, [])
        .value())
    })
  }
}
