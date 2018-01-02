import * as _ from 'lodash'
import * as moment from 'moment'
import { FINNISH_WEEKDAYS } from 'lounasvahti/constants'

export function getFinnishDayName (date: Date): string | undefined {
  // Note that the the ISO weekday is 1-7 while our weekdays are 0-4.
  return _.nth(FINNISH_WEEKDAYS, moment(date).isoWeekday() - 1)
}
