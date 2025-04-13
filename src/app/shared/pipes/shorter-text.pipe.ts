import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shorterText',
  standalone: true
})
export class ShorterTextPipe implements PipeTransform {
  transform(value: string, limit: number = 30, trail: string = '...'): string {
    if (!value) {
      return '';
    }
    if (value.length <= limit) {
      return value;
    }
    return value.slice(0, limit) + trail;
  }
}
