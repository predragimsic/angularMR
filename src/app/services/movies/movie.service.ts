import { Injectable } from '@angular/core';
import { Genre } from 'src/app/model/genre.model';
import { BehaviorSubject } from 'rxjs';
import { take, switchMap, map, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Movie } from 'src/app/model/movie.model';

interface GenreData {
  name: string;
}

export interface MovieData {
  name?: string;
  producer?: string;
  image: string;
  description: string;
  year: number;
  genre: Genre;
  country: string;
  budget: number;
  duration: number;
  fetchedUserId: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  // tslint:disable-next-line: variable-name
  private _genres = new BehaviorSubject<Genre[]>([]);
  // tslint:disable-next-line: variable-name
  private _movies = new BehaviorSubject<Movie[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get genres() {
    return this._genres.asObservable();
  }

  get movies() {
    return this._movies.asObservable();
  }

  getGenres() {
    console.log('getGenres service');
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .get<{ [key: string]: GenreData }>(
            `https://movies-app-6bff9.firebaseio.com/genre.json?auth=${token}`
          );
      }),
      map((genresData) => {
        console.log(genresData);
        const genres: Genre[] = [];
        for (const key in genresData) {
          if (genresData.hasOwnProperty(key)) {
            genres.push(
              new Genre(
                key,
                genresData[key].name
              ));
          }
        }
        return genres;
      }),
      tap(genres => {
        this._genres.next(genres);
      })
    );

  }

  getMovies() {
    console.log('getMovies service');
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .get<{ [key: string]: MovieData }>(
            `https://movies-app-6bff9.firebaseio.com/movie.json?auth=${token}`
          );
      }),
      map((moviesData) => {
        console.log(moviesData);
        const movies: Movie[] = [];
        for (const key in moviesData) {
          if (moviesData.hasOwnProperty(key)) {
            movies.push(
              new Movie(
                key,
                moviesData[key].name,
                moviesData[key].producer,
                moviesData[key].image,
                moviesData[key].description,
                moviesData[key].year,
                moviesData[key].country,
                moviesData[key].genre,
                moviesData[key].budget,
                moviesData[key].duration,
                moviesData[key].fetchedUserId

              ));
          }
        }
        return movies;
      }),
      tap(movies => {
        this._movies.next(movies);
      })
    );

  }

  addMovie(movie: Movie) {
    let generatedId;
    let fetchedUserId: string;

    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {

        movie.userId = fetchedUserId;
        console.log(movie.genre.name);
        return this.http
          .post<{ name: string }>(
            `https://movies-app-6bff9.firebaseio.com/movie.json?auth=${token}`,
            movie
          );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.movies;
      }),
      take(1),
      tap((movies) => {
        movie.id = generatedId;
        this._movies.next(
          movies.concat(movie)
        );
      })
    );
  }
  getMovie(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .get<MovieData>(`https://movies-app-6bff9.firebaseio.com/movie/${id}.json?auth=${token}`);
      }),
      map((resData) => {
        console.log(resData);
        return new Movie(
          id,
          resData.name,
          resData.producer,
          resData.image,
          resData.description,
          resData.year,
          resData.country,
          resData.genre,
          resData.budget,
          resData.duration,
          resData.fetchedUserId
        );
      })
    );

  }

  deleteMovie(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .delete(`https://movies-app-6bff9.firebaseio.com/movie/${id}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.movies;
      }),
      take(1),
      tap((movies) => {
        this._movies.next(movies.filter((m) => m.id !== id));
      })
    );
  }

  editMovie(movie: Movie) {

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http
          .put(`https://movies-app-6bff9.firebaseio.com/movie/${movie.id}.json?auth=${token}`, 
            movie
          );
      }),
      switchMap(() => this.movies),
      take(1),
      tap((movies) => {
        const updatedMovieID = movies.findIndex((m) => m.id === movie.id);
        const updatedMovies = [...movies];
        updatedMovies[updatedMovieID] = movie;
        this._movies.next(updatedMovies);
      })
    );

  }
}
