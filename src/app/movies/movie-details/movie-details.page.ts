import { Component, OnInit } from '@angular/core';
import { Movie } from 'src/app/model/movie.model';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ModalController } from '@ionic/angular';
import { MovieService } from 'src/app/services/movies/movie.service';
import { MovieModalComponent } from '../movie-modal/movie-modal.component';

@Component({
    selector: 'app-movie-details',
    templateUrl: './movie-details.page.html',
    styleUrls: ['./movie-details.page.scss'],
})
export class MovieDetailsPage implements OnInit {
    movie: Movie;
    isLoading = false;

    constructor(private route: ActivatedRoute,
                private navCtrl: NavController,
                private moviesService: MovieService,
                private loadingCtrl: LoadingController,
                private modalCtrl: ModalController) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            if (!paramMap.has('movieId')) {
                this.navCtrl.navigateBack('/movies');
                return;
            }

            this.isLoading = true;

            this.moviesService
                .getMovie(paramMap.get('movieId'))
                .subscribe((movie) => {
                    this.movie = movie;
                    this.isLoading = false;
                });
        });
    }

    onDeleteMovie() {
        this.loadingCtrl.create({ message: 'Deleting...' }).then(loadingEl => {
            loadingEl.present();
            this.moviesService.deleteMovie(this.movie.id).subscribe(() => {
                loadingEl.dismiss();
                this.navCtrl.navigateBack('/movies');
            });
        });
    }

    onEditMovie() {
        this.modalCtrl.create({
            component: MovieModalComponent,
            componentProps: { movie: this.movie }
        }).then((modal) => {
            modal.present();
            return modal.onDidDismiss();
        }).then((resultData) => {
            if (resultData.role === 'confirm') {
                console.log(resultData);

                const movie = new Movie(
                    this.movie.id,
                    resultData.data.movieData.name,
                    resultData.data.movieData.producer,
                    resultData.data.movieData.image,
                    resultData.data.movieData.description,
                    resultData.data.movieData.year,
                    resultData.data.movieData.country,
                    resultData.data.movieData.genre,
                    resultData.data.movieData.budget,
                    resultData.data.movieData.duration,
                    null);

                this.moviesService
                    .editMovie(
                        movie)
                    .subscribe((res) => {
                        this.movie = movie;
                    });
            }
        });
    }
}
