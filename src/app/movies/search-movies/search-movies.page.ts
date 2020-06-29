import { Component, OnInit, Input } from '@angular/core';
import { MovieService } from 'src/app/services/movies/movie.service';
import { Movie } from 'src/app/model/movie.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-movies',
  templateUrl: './search-movies.page.html',
  styleUrls: ['./search-movies.page.scss'],
})
export class SearchMoviesPage implements OnInit {
  searchText = '';
  movies: Movie[] = [];
  private moviesSub: Subscription;

  constructor(private movieService: MovieService) { }

  ngOnInit() {
    this.moviesSub = this.movieService.movies.subscribe((movies) => {
      this.movies = movies;
    });
  }


  ionViewWillEnter() {
    this.movieService.getMovies().subscribe((movies) => {
      // this.movies = movies;
    });

  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    if (this.moviesSub) {
        this.moviesSub.unsubscribe();
    }
}


}
