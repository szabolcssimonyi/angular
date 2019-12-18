import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenText'
})
export class ShortenTextPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const data: string = value;
    const length: number = args.length > 0 ? args[0] : 20;
    if (!Boolean(data)) {
      return '';
    }
    return data.length > 20 ? `${data.substr(0, length - 3)}...` : data;
  }

}
