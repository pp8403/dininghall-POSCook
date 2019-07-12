import { Pipe, PipeTransform } from '@angular/core';
import Moment from 'moment';

/**
 * Generated class for the MomentPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'moment',
})
export class MomentPipe implements PipeTransform {
  transform(d: Date | Moment.Moment | string, args?: any[]):string {
    // utc add 8 hours into beijing
    let rv = Moment(d).format(args[0]);
    return rv;
  }
}

@Pipe({
  name: 'momentweek',
})
export class MomentWeekPipe implements PipeTransform {
  transform(d: Date | Moment.Moment | string):string {
    // utc add 8 hours into beijing
    let week = Moment(d).get('weekday');
    let weekdays=['日', '一', '二', '三', '四', '五', '六'];
    return `星期${weekdays[week]}`;
  }
}