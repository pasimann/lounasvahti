import axios from 'axios'
import * as moment from 'moment'

import { Place } from 'lounasvahti/place'

export class Sodexo extends Place {
  private static BASE_URL = 'https://www.sodexo.fi/ruokalistat/output/daily_json/66'

  public header: string = 'Valtakunnanjohtaja Siitoin suosittelee:'

  public menu (date: Date): Promise<string[]> {
    const y = moment(date).get('year')
    const d = moment(date).get('date')
    const m = moment(date).get('month') + 1
    return Promise.resolve(axios.get(`${Sodexo.BASE_URL}/${y}/${m}/${d}/fi`)).then((response) => {
      return response.data.courses.map(course => course.title_fi)
    })
  }
}
