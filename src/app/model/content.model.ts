import { Genre } from './genre.model';

export abstract class Content {
  constructor(public id: string, public name: string, public producer: string,
              // tslint:disable-next-line: max-line-length
              public image: string, public description: string, public year: number, public country: string, public genre: Genre,public userId: string) {
  }

}
