import axios from 'axios'
import * as moment from 'moment'

import { Place } from 'lounasvahti/place'

export class Sodexo extends Place {
  public name: RegExp = /(sodexo|alaker(ta|rassa))/
  public header: string = 'Sodexossa:'

  private url: string = 'https://www.sodexo.fi/ruokalistat/output/daily_json/66'

  public menu (date: Date): Promise<string[]> {
    const y = moment(date).get('year')
    const d = moment(date).get('date')
    const m = moment(date).get('month') + 1
    return Promise.resolve(axios.get(`${this.url}/${y}/${m}/${d}/fi`)).then((response) => {
      return response.data.courses.map(course => course.title_fi)
    })
  }
}
