import { Content } from './content.model';
import { Genre } from './genre.model';

export class Movie extends Content {
  constructor(public id: string, public name: string, public producer: string,
              public image: string, public description: string, public year: number, public country: string,
              public genre: Genre, public numberOfSeasons: number, public averageDuration: number, public userId: string) {
    super(id, name, producer, image, description, year, country, genre, userId);
  }

}
