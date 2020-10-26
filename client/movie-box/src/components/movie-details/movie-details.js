import React, { Component } from 'react';
import { Link } from "react-router-dom";

import './movie-details.css';
import '../../service/movie-box-api';
import { deleteMovie, getMovie } from '../../service/movie-box-api';

class MovieDetails extends Component {

    // State of the MovieDetails Component
    state = {
        movieObject: {
            movieId: '',
            movieName: '',
            director: '',
            popularity: 0,
            score: 0,
            createdDate: '',
            lastModifiedDate: '',
            createdBy: '',
            lastModifiedBy: '',
            createdByGoogleUserId: '',
            genreList: []
        },
        isSignedIn: true,
        isNewMode: false
    }

    // After Component mounts, fetch details of the movie
    componentDidMount() {
        const { movieId } = this.props.match.params;
        if (movieId) {
            if (movieId === '00000000-0000-0000-0000-000000000000') {
                this.setState({ isNewMode: true });
            } else {
                this.getMovieDetails(movieId);
            }
        }
    }

    // API Functions------------------------------------------
    /**
     * Fetches movie details from the database
     * @param {String} movieId 
     */
    getMovieDetails = (movieId) => {
        getMovie(movieId)
            .then((response) => {
                if (response.data.status === 0 && 
                    response.data.data &&
                    response.data.data.length === 1) {
                    const responseData = response.data.data[0]; 
                    let movieObject = {};
                    movieObject.movieId = responseData.id;
                    movieObject.movieName = responseData.name;
                    movieObject.director = responseData.director;
                    movieObject.popularity = responseData.popularity;
                    movieObject.score = responseData.score;
                    movieObject.createdDate = responseData.createddate;
                    movieObject.lastModifiedDate = responseData.lastmodifieddate;
                    movieObject.createdBy = responseData.createdby;
                    movieObject.lastModifiedBy = responseData.lastmodifiedby;
                    movieObject.createdByGoogleUserId = responseData.createdbygoogleuserid;
                    movieObject.genreList = responseData.genres ? responseData.genres.map(element => element.name) : [];
                    this.setState({ movieObject });
                    console.log(this.state);
                } else {
                    console.log(response.data.data.msg);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Saves Movie Data
     */
    saveMovie = () => {

    }

    /**
     * Deletes Movie and redirects user to Home page
     */
    deleteMovie = () => {
        if (window.confirm('Are you sure you want to delete?')) {
            deleteMovie(this.state.movieObject.movieId)
                .then((response) => {
                    if (response.data.status === 0){ 
                        this.props.history.push('/');
                    } else {
                        console.log(response.data.data.msg);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    // Logical Functions--------------------------------------
    /**
     * Validates Save Object and prints the error message in case of an invalid object
     * @returns {Boolean}
     */
    validateSaveObject = () => {

    }

    // IsVisible Functions------------------------------------
    /**
     * Determines if movie name input should be editable or not
     * @returns {Boolean}
     */
    isUserSignedInAndIsNewMode = () => {
        if (this.state.isNewMode && this.state.isSignedIn) {
            return true;
        }
        return false;
    }

    /**
     * Determines if director, popularity, score input and action buttons should be editable / clickable or not
     * @returns {Boolean}
     */
    isUserSignedIn = () => {
        if (this.state.isSignedIn) {
            return true;
        }
        return false;
    }

    /**
     * Determines if delete action button should be clickable or not
     * @returns {Boolean}
     */
    isUserSignedInAndIsNotNewMode = () => {
        if (!this.state.isNewMode && this.state.isSignedIn) {
            return true;
        }
        return false;
    }

    // OnChange Functions-------------------------------------
    /**
     * Updates state when movie name is updated
     * @param {Event} event
     */
    onMovieNameChange = (event) => {
        const { value } = event.currentTarget;
        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            movieObject.movieName = value;
            return { movieObject };
        });
    }

    /**
     * Updates state when director is updated
     * @param {Event} event
     */
    onDirectorChange = (event) => {
        const { value } = event.currentTarget;
        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            movieObject.director = value;
            return { movieObject };
        });
    }

    /**
     * Updates state when popularity is updated
     * @param {Event} event
     */
    onPopularityChange = (event) => {
        const { value } = event.currentTarget;
        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            movieObject.popularity = value;
            return { movieObject };
        });
    }

    /**
     * Updates state when score is updated
     * @param {Event} event
     */
    onScoreChange = (event) => {
        const { value } = event.currentTarget;
        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            movieObject.score = value;
            return { movieObject };
        });
    }

    /**
     * Renders the Entire Component
     */
    render() {
        return (
            <div className="movie-details--main-div">
                <Link to="/" className="movie-details--link">❮ Go Back to Home</Link>

                <div className="movie-details--form">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Name:</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Movie Name" 
                                    className="form-control home--input" 
                                    aria-label="Movie Name" 
                                    onChange={this.onMovieNameChange}
                                    value={this.state.movieObject.movieName}
                                    disabled={!this.isUserSignedInAndIsNewMode()}
                                    aria-describedby="inputGroup-sizing-default"></input>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Director:</span>
                                </div>
                                <input 
                                type="text" 
                                placeholder="Director Name" 
                                className="form-control home--input" 
                                aria-label="Director Name" 
                                onChange={this.onDirectorChange}
                                value={this.state.movieObject.director}
                                disabled={!this.isUserSignedIn()}
                                aria-describedby="inputGroup-sizing-default"></input>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Popularity:</span>
                                </div>
                                <input 
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Popularity Value" 
                                className="form-control home--input" 
                                aria-label="Popularity Value" 
                                onChange={this.onPopularityChange}
                                value={this.state.movieObject.popularity}
                                disabled={!this.isUserSignedIn()}
                                aria-describedby="inputGroup-sizing-default"></input>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Score:</span>
                                </div>
                                <input 
                                type="number" 
                                min="0"
                                max="100"
                                placeholder="Score Value" 
                                className="form-control home--input" 
                                aria-label="Score Value" 
                                onChange={this.onScoreChange}
                                value={this.state.movieObject.score}
                                disabled={!this.isUserSignedIn()}
                                aria-describedby="inputGroup-sizing-default"></input>
                            </div>
                        </div>
                    </div>

                    <div className="row" hidden={!this.isUserSignedIn()}>
                        <button className="btn btn-primary movie-details--button" onClick={this.saveMovie}>Save</button>
                        <button className="btn btn-danger movie-details--button" onClick={this.deleteMovie} hidden={!this.isUserSignedInAndIsNotNewMode()}>Delete</button>
                    </div>
                </div>

                {/* <div className="row">
                    <div className="col-md-4">
                        <div className="input-group mb-3 home--search-input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text" id="inputGroup-sizing-default">Name:</span>
                            </div>
                            <input 
                            type="text" 
                            placeholder="Enter Search Text Here" 
                            className="form-control home--input" 
                            aria-label="Search Text" 
                            onChange={this.onSearchTermChange}
                            value={this.state.searchParams.searchTerm}
                            aria-describedby="inputGroup-sizing-default"></input>
                        </div>
                    </div>
                </div> */}

                
            </div>
        );
    }
}

export default MovieDetails;