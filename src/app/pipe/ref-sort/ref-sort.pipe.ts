import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that sorts an array of objects based on a specific property.
 */
@Pipe({
  name: 'refSort'
})
export class RefSortPipe implements PipeTransform {

  public transform(value: any[], type: boolean): any[] {
    return value.sort(this.sortOn(type));
  }

  private sortOn(type: boolean): ((a: any, b: any) => number) {
    return (obj1: any, obj2: any): number => {
      let a: string;
      let b: string;

      if (type) {
        a = obj1.libelle;
        b = obj2.libelle;
      } else {
        a = obj1.abrege ? obj1.abrege : obj1.designation;
        b = obj2.abrege ? obj2.abrege : obj2.designation;
      }

      return a > b ? 1 : a < b ? -1 : 0;
    };
  }
}
