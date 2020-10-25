import React, { Component } from 'react';

import './home.css';

import '../../service/movie-box-api';
import { getGenres, searchMovies } from '../../service/movie-box-api';
import MovieTile from '../movie-tile/movie-tile';

class Home extends Component {

    state = {
        searchParams: {
            searchTerm: "",
            sortBy: "name",
            sortOrder: "asc",
            genreList: [],
            pageSize: 15,
            pageNumber: 1,
            ignoreGenres: true
        },
        movieList: [],
        genres: [],
        isSignedIn: null
    }

    componentDidMount() {
        searchMovies(this.state.searchParams)
            .then((response) => {
                if (response.data.status === 0) {
                    this.setState({movieList: response.data.data});
                } else {
                    console.log(response.data.data.msg);
                }
            })
            .catch((err) => {
                console.log(err);
            });
        getGenres()
            .then((response) => {
                if (response.data.status === 0) {
                    this.setState(prevState => { 
                        let searchParams = { ...prevState.searchParams };
                        searchParams.genreList = response.data.data;
                        return {
                            genres: response.data.data, 
                            searchParams: searchParams
                        };
                    });
                } else {
                    console.log(response.data.data.msg);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    renderMovieTiles() {
        return this.state.movieList.map(tile => {
            tile.color = 'rgba(66, 103, 178, 1)';
            tile.link = `/movie/${tile.id}`;
            return (
                <div key={tile.id} className="col-md-6 col-xl-4 home--tile">
                    <MovieTile data={tile} />
                </div>
            );
        });
    }

    render() {
        return (
            <div className="container-fluid home--main-div">
                <h3 className="home--heading">Welcome!</h3>
                <div className="row home--tile-row">
                    {this.renderMovieTiles()}
                </div>
            </div>
        );
    }
}

export default Home;