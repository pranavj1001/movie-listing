import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';

import './movie-details.css';
import '../../service/movie-box-api';
import { deleteMovie, getMovie, saveMovie, getGenres } from '../../service/movie-box-api';

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
        isNewMode: false,
        genreDropdownToggle: false,
        genres: [],
        newGenre: ''
    }

    // After Component mounts, fetch details of the movie
    componentDidMount() {
        const { movieId } = this.props.match.params;
        if (movieId) {
            if (movieId === '00000000-0000-0000-0000-000000000000') {
                this.setState({ isNewMode: true });
                this.getAllGenres();
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
                    this.getAllGenres();
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
    saveMovie = async () => {
        if (window.confirm('Are you sure you want to save?')) {
            const validationString = this.validateSaveObject();
            if(validationString === '') {
                await this.onUserEmailChange(this.props.email);
                saveMovie(this.state.movieObject)
                    .then((response) => {
                        if (response.data.status === 0){ 
                            if (this.state.isNewMode) {
                                this.setState(prevState => { 
                                    let movieObject = { ...prevState.movieObject };
                                    movieObject.movieId = response.data.data.movieid;
                                    return { movieObject, isNewMode: false };
                                });
                            }
                            alert('Movie was saved successfully!');
                        } else {
                            console.log(response.data.data.msg);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                alert(validationString);
            }
        }
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

    /**
     * Fetches all genres stored in database. Is called once component loads
     */
    getAllGenres = () => {
        getGenres()
            .then((response) => {
                if (response.data.status === 0) {
                    const genres = [];
                    for (const genre of response.data.data) {
                        genre.checked = false;
                        for (const selectedGenre of this.state.movieObject.genreList) {
                            if (genre.name === selectedGenre) {
                                genre.checked = true;
                            }
                        }
                        genres.push(genre);
                    }
                    this.setState({ genres });
                } else {
                    console.log(response.data.data.msg);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // Logical Functions--------------------------------------
    /**
     * Validates Save Object and prints the error message in case of an invalid object
     * @returns {String}
     */
    validateSaveObject = () => {
        let validationString = '';

        if (!(this.state.movieObject.movieName && this.state.movieObject.movieName.trim() !== '')) {
            validationString +='\n- Movie Name cannot be empty.';
        } else if (this.state.movieObject.movieName.length > 256) {
            validationString +='\n- Movie Name length cannot be greater than 256.';
        }

        if (!(this.state.movieObject.director && this.state.movieObject.director.trim() !== '')) {
            validationString +='\n- Movie Director cannot be empty.';
        } else if (this.state.movieObject.director.length > 256) {
            validationString +='\n- Movie Director length cannot be greater than 256.';
        }

        if (!(this.state.movieObject.genreList && this.state.movieObject.genreList.length > 0)) {
            validationString +='\n- Movie should atleast have 1 genre.';
        }

        if (!(this.state.movieObject.popularity && this.state.movieObject.popularity.toString().trim() !== '')) {
            validationString +='\n- Movie Popularity cannot be empty.';
        } else if (this.state.movieObject.popularity > 100) {
            validationString +='\n- Movie Popularity cannot be greater than 100.';
        }

        if (!(this.state.movieObject.score && this.state.movieObject.score.toString().trim() !== '')) {
            validationString +='\n- Movie Score cannot be empty.';
        } else if (this.state.movieObject.score > 10) {
            validationString +='\n- Movie Score cannot be greater than 10.';
        }

        return validationString;
    }

    /**
     * Pushes a new unique to Genre List
     */
    pushNewGenre = () => {
        const value = this.state.newGenre;

        if (value.trim() === '') {
            alert('New Genre cannot be empty');
            return;
        }

        for (const genre of this.state.genres) {
            if (genre.name.toLowerCase().trim() === value.toLowerCase().trim()) {
                alert('Genre already exists');
                return;
            } 
        }

        let genres = this.state.genres;
        genres.push({
            id: '',
            name: value,
            checked: true
        });

        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            const genreList = genres.filter(element => element.checked);
            movieObject.genreList = genreList.map(element => element.name);
            return { genres, movieObject, newGenre: '' };
        });
    }

    // IsVisible Functions------------------------------------
    /**
     * Determines if movie name input should be editable or not
     * @returns {Boolean}
     */
    isUserSignedInAndIsNewMode = () => {
        if (this.state.isNewMode && this.props.isSignedIn) {
            return true;
        }
        return false;
    }

    /**
     * Determines if director, popularity, score input and action buttons should be editable / clickable or not
     * @returns {Boolean}
     */
    isUserSignedIn = () => {
        if (this.props.isSignedIn) {
            return true;
        }
        return false;
    }

    /**
     * Determines if delete action button should be clickable or not
     * @returns {Boolean}
     */
    isUserSignedInAndIsNotNewMode = () => {
        if (!this.state.isNewMode && this.props.isSignedIn) {
            return true;
        }
        return false;
    }

    // Toggler Functions--------------------------------------
    /**
     * Toggles Genres Dropdown Options
     */
    toggleGenreDropdown = () => {
        const genreDropdownToggle = !this.state.genreDropdownToggle;
        this.setState({ genreDropdownToggle: genreDropdownToggle });
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
     * Updates state when email is updated
     * @param {String} newValue 
     */
    onUserEmailChange = async (newValue) => {
        await this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            if (this.state.movieObject.movieId === '') {
                movieObject.createdBy = newValue;
            }
            movieObject.lastModifiedBy = newValue;
            return { movieObject };
        });
    }

    /**
     * Updates state when genre is updated
     * @param {Event} event 
     * @param { {id: String, name: String, checked: bool} } genre 
     */
    onGenreChange = (event, genre) => {
        let genres = this.state.genres;
        for (const genreItem of genres) {
            if (genreItem.id === genre.id) {
                genreItem.checked = event.currentTarget.checked;
                break;
            }
        }

        this.setState(prevState => { 
            let movieObject = { ...prevState.movieObject };
            const  genreList = genres.filter(element => element.checked);
            movieObject.genreList = genreList.map(element => element.name);
            return { genres, movieObject };
        });
    }

    /**
     * Updates state when new genre input is updated
     * @param {Event} event
     */
    onNewGenreChange = (event) => {
        const { value } = event.currentTarget;
        this.setState({ newGenre: value });
    }

    // Render Functions---------------------------------------
    /**
     * Renders the options of Genres Dropdown
     */
    renderGenresDropdown = () => {
        if (this.state.genres && this.state.genres.length > 0) {
            if (this.state.genres.length === 0) {
                return (
                    <div className="dropdown-item" >
                        Loading...
                    </div>
                );
            } else {
                return this.state.genres.map(genre => {
                    return (
                        <div className="dropdown-item home--dropdown-item" key={genre.id}>
                            <input 
                                type="checkbox" 
                                className="form-check-input home--dropdown-input" 
                                disabled={!this.isUserSignedIn()}
                                onChange={(event) => this.onGenreChange(event, genre)}
                                defaultChecked={genre.checked}
                            ></input>
                            {genre.name}
                        </div>
                    );
                });
            }
        } else {
            return (
                <div className="dropdown-item" >
                    No Results found in the database.
                </div>
            );
        }
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
                                max="10"
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

                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text home--input-text" id="inputGroup-sizing-default">Genres:</span>
                                </div>
                                <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="genresDropdown" onClick={this.toggleGenreDropdown}>
                                        {this.isUserSignedIn() ? 'Click to view your Selected Genres' : 'Click to view this Movie\'s Genres'}
                                    </button>
                                    <div className="dropdown-menu home--dropdown-menu" aria-labelledby="genresDropdown" style={{display: (this.state.genreDropdownToggle ? 'block' : 'none')}}>
                                        {this.renderGenresDropdown()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row" hidden={!this.isUserSignedIn()}>
                        <div className="col-md-6">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Add new Genre:</span>
                                </div>
                                <input 
                                type="text" 
                                placeholder="New Genre Name" 
                                className="form-control home--input" 
                                aria-label="New Genre Name" 
                                onChange={this.onNewGenreChange}
                                value={this.state.newGenre}
                                aria-describedby="inputGroup-sizing-default"></input>
                                <button className="btn btn-default" onClick={this.pushNewGenre}>Push</button>
                            </div>
                        </div>
                    </div>

                    <div className="row" hidden={!this.isUserSignedInAndIsNotNewMode()}>
                        <div className="alert alert-info home--alert home--paragraph" role="alert">
                            Created By: {this.state.movieObject.createdBy}
                        </div>
                        <div className="alert alert-info home--alert home--paragraph" role="alert">
                            Last Modified By: {this.state.movieObject.lastModifiedBy}
                        </div>
                        <div className="alert alert-info home--alert home--paragraph" hidden={this.state.movieObject.createdDate === ''} role="alert">
                            Created On: {this.state.movieObject.createdDate}
                        </div>
                        <div className="alert alert-info home--alert home--paragraph" hidden={this.state.movieObject.lastModifiedDate === ''} role="alert">
                            Last Modified On: {this.state.movieObject.lastModifiedDate}
                        </div>
                    </div>

                    <div className="row" hidden={!this.isUserSignedIn()}>
                        <button className="btn btn-primary movie-details--button" onClick={this.saveMovie}>Save</button>
                        <button className="btn btn-danger movie-details--button" onClick={this.deleteMovie} hidden={!this.isUserSignedInAndIsNotNewMode()}>Delete</button>
                    </div>
                </div>

                
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { isSignedIn: state.auth.isSignedIn, email: state.auth.email };
};

export default connect(mapStateToProps)(MovieDetails);