import React, { Component } from 'react';

import './home.css';

import '../../service/movie-box-api';
import { getGenres, searchMovies } from '../../service/movie-box-api';
import MovieTile from '../movie-tile/movie-tile';

class Home extends Component {

    // State of the Home Component
    state = {
        searchParams: {
            searchTerm: '',
            sortBy: 'Name',
            sortOrder: 'ASC',
            genreList: [],
            pageSize: 15,
            pageNumber: 1,
            ignoreGenres: true
        },
        movieList: [],
        genres: [],
        isSignedIn: null,
        sortByDropdownToggle: false,
        sortByDropdownOptions: ['Name', 'Popularity', 'Director'],
        sortByDropdownString: 'Name',
        sortOrderDropdownToggle: false,
        sortOrderDropdownOptions: ['ASC', 'DESC'],
        sortOrderDropdownString: 'ASC',
        genreDropdownToggle: false,
        pageSizeDropdownToggle: false,
        pageSizeDropdownOptions: [ 10, 15, 25, 50, 100],
        pageSizeDropdownString: 15,
        totalPageCount: 1,
        totalSearchResults: 0
    }

    // After Component mounts, fetch a list of movies and all genres
    componentDidMount() {
        this.searchMovies(false);
        this.getAllGenres();
    }

    // API Functions------------------------------------------
    /**
     * Fetches list of movies based on search parameters from database.
     * @param {Boolean} isCalledBySearchButton 
     */
    searchMovies = async (isCalledBySearchButton = true) => {
        if (isCalledBySearchButton) {
            await this.onPageNumberChange(1);
        }
        searchMovies(this.state.searchParams)
            .then((response) => {
                if (response.data.status === 0) {
                    let totalSearchResults = 0;
                    if (response.data.data && response.data.data.length > 0) {
                        totalSearchResults = response.data.data[0].count;
                    }
                    this.setState({movieList: response.data.data, totalSearchResults});
                    this.calculateMaximumNumberofAllowedPages();
                } else {
                    console.log(response.data.data.msg);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    /**
     * Fetches all genres stored in database. Is called once component loads
     */
    getAllGenres = () => {
        getGenres()
            .then((response) => {
                if (response.data.status === 0) {
                    this.setState(prevState => { 
                        let searchParams = { ...prevState.searchParams };
                        searchParams.genreList = response.data.data.map(element => element.id);
                        searchParams.ignoreGenres = false;
                        const genres = response.data.data.map(element => ({...element, checked: true}) );
                        return { genres, searchParams };
                    });
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
     * Calculates the max number of pages after every search
     */
    calculateMaximumNumberofAllowedPages = () => {
        const totalPageCount = Math.ceil(this.state.totalSearchResults / this.state.searchParams.pageSize);
        this.setState({ totalPageCount });
        // this.resetPageNumberIfInvalid();
    }

    /**
     * Reset Page Number to 1 in case of an invalid value
     */
    resetPageNumberIfInvalid = async () => {
        if (this.state.searchParams.pageNumber < 1 || this.state.searchParams.pageNumber > this.state.totalPageCount) {
            await this.onPageNumberChange(1);
            this.searchMovies(false);
        }
    }

    /**
     * Decrements Current Page number and searches for the results
     */
    goToPreviousPage = async () => {
        if (this.state.searchParams.pageNumber > 1) {
            const pageNumber = this.state.searchParams.pageNumber - 1;
            await this.onPageNumberChange(pageNumber);
            this.searchMovies(false);
        }
    }

    /**
     * Increments Current Page number and searches for the results
     */
    goToNextPage = async () => {
        if (this.state.searchParams.pageNumber < this.state.totalPageCount) {
            const pageNumber = this.state.searchParams.pageNumber + 1;
            await this.onPageNumberChange(pageNumber);
            this.searchMovies(false);
        }
    }

    // IsVisible Functions------------------------------------
    /**
     * Determines to show previous page button or not based on some conditions
     * @returns {Boolean}
     */
    isPreviousPageButtonClickable = () => {
        if (this.state.searchParams.pageNumber === 1) {
            return false;
        }
        return true;
    }

    /**
     * Determines to show next page button or not based on some conditions
     * @returns {Boolean}
     */
    isNextPageButtonClickable = () => {
        if (this.state.searchParams.pageNumber === this.state.totalPageCount) {
            return false;
        }
        return true;
    }

    // OnChange Functions-------------------------------------
    /**
     * Updates state when search term is updated
     * @param {Event} event
     */
    onSearchTermChange = (event) => {
        const { value } = event.currentTarget;
        this.setState(prevState => { 
            let searchParams = { ...prevState.searchParams };
            searchParams.searchTerm = value;
            return { searchParams };
        });
    }

    /**
     * Updates state when sortBy is updated
     * @param {String} newValue 
     */
    onSortByChange = (newValue) => {
        this.setState(prevState => { 
            let searchParams = { ...prevState.searchParams };
            searchParams.sortBy = newValue;
            return {
                sortByDropdownString: newValue, 
                searchParams: searchParams
            };
        });
    }

    /**
     * Updates state when sortOrder is updated
     * @param {String} newValue 
     */
    onSortOrderChange = (newValue) => {
        this.setState(prevState => { 
            let searchParams = { ...prevState.searchParams };
            searchParams.sortOrder = newValue;
            return {
                sortOrderDropdownString: newValue, 
                searchParams: searchParams
            };
        });
    }

    /**
     * Updates state when pageSize is updated
     * @param {Number} newValue 
     */
    onPageSizeChange = (newValue) => {
        this.setState(prevState => { 
            let searchParams = { ...prevState.searchParams };
            searchParams.pageSize = newValue;
            return {
                pageSizeDropdownString: newValue, 
                searchParams: searchParams
            };
        });
    }

    /**
     * Updates state when pageNumber is updated
     * @param {Number} newValue 
     */
    onPageNumberChange = async (newValue) => {
        await this.setState(prevState => { 
            let searchParams = { ...prevState.searchParams };
            searchParams.pageNumber = newValue;
            return { searchParams };
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
            let searchParams = { ...prevState.searchParams };
            const  genreList = genres.filter(element => element.checked);
            searchParams.genreList = genreList.map(element => element.id);
            return { genres, searchParams };
        });
    }

    // Toggler Functions--------------------------------------
    /**
     * Toggles SortBy Dropdown Options
     */
    toggleSortByDropdown = () => {
        const sortByDropdownToggle = !this.state.sortByDropdownToggle;
        this.setState({ sortByDropdownToggle });
    }

    /**
     * Toggles SortOrder Dropdown Options
     */
    toggleSortOrderDropdown = () => {
        const sortOrderDropdownToggle = !this.state.sortOrderDropdownToggle;
        this.setState({ sortOrderDropdownToggle });
    }

    /**
     * Toggles PageSize Dropdown Options
     */
    togglePageSizeDropdown = () => {
        const pageSizeDropdownToggle = !this.state.pageSizeDropdownToggle;
        this.setState({ pageSizeDropdownToggle });
    }

    /**
     * Toggles Genres Dropdown Options
     */
    toggleGenreDropdown = () => {
        const genreDropdownToggle = !this.state.genreDropdownToggle;
        this.setState({ genreDropdownToggle: genreDropdownToggle });
    }

    // Render Functions---------------------------------------
    /**
     * Renders the Movie Tiles
     */
    renderMovieTiles = () => {
        if (this.state.movieList && this.state.movieList.length > 0) {
            if (this.state.movieList.length === 0) {
                return (
                    <div className="alert alert-info home--alert home--paragraph" role="alert">
                        Loading...
                    </div>
                );
            } else {
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
        } else {
            return (
                <div className="alert alert-info home--alert home--paragraph" role="alert">
                    No Results found in the database.
                </div>
            );
        }
    }

    /**
     * Renders the options of SortBy Dropdown
     */
    renderSortByDropdown = () => {
        return this.state.sortByDropdownOptions.map(option => {
            return (
                <div className="dropdown-item" key={option} onClick={this.onSortByChange.bind(this, option)}>
                    {option}
                </div>
            );
        });
    }

    /**
     * Renders the options of SortOrder Dropdown
     */
    renderSortOrderDropdown = () => {
        return this.state.sortOrderDropdownOptions.map(option => {
            return (
                <div className="dropdown-item" key={option} onClick={this.onSortOrderChange.bind(this, option)}>
                    {option}
                </div>
            );
        });
    }

    /**
     * Renders the options of PageSize Dropdown
     */
    renderPageSizeDropdown = () => {
        return this.state.pageSizeDropdownOptions.map(option => {
            return (
                <div className="dropdown-item" key={option} onClick={this.onPageSizeChange.bind(this, option)}>
                    {option}
                </div>
            );
        });
    }

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
            <div className="container-fluid home--main-div">
                <h3 className="home--heading">Welcome!</h3>

                <div className="home--tools">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" id="inputGroup-sizing-default">Search Text:</span>
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
                        <div className="col-md-8">
                            <div className="input-group mb-3 home--search-input-group home--dropdown-inline-block home--dropdown-width-auto">
                                <div className="input-group-prepend home--dropdown-inline-block">
                                    <span className="input-group-text home--input-text" id="inputGroup-sizing-default">Sort By:</span>
                                </div>
                                <div className="dropdown home--dropdown home--dropdown-inline-block">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="sortByDropdown" onClick={this.toggleSortByDropdown}>
                                        {this.state.sortByDropdownString}
                                    </button>
                                    <div className="dropdown-menu home--dropdown-menu" aria-labelledby="sortByDropdown" style={{display: (this.state.sortByDropdownToggle ? 'block' : 'none')}}>
                                        {this.renderSortByDropdown()}
                                    </div>
                                </div>
                            </div>
                            <div className="input-group mb-3 home--search-input-group home--dropdown-inline-block home--dropdown-width-auto">
                                <div className="input-group-prepend home--dropdown-inline-block">
                                    <span className="input-group-text home--input-text" id="inputGroup-sizing-default">Sort Order:</span>
                                </div>
                                <div className="dropdown home--dropdown home--dropdown-inline-block">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="sortOrderDropdown" onClick={this.toggleSortOrderDropdown}>
                                        {this.state.sortOrderDropdownString}
                                    </button>
                                    <div className="dropdown-menu home--dropdown-menu" aria-labelledby="sortOrderDropdown" style={{display: (this.state.sortOrderDropdownToggle ? 'block' : 'none')}}>
                                        {this.renderSortOrderDropdown()}
                                    </div>
                                </div>
                            </div>
                            <div className="input-group mb-3 home--search-input-group home--dropdown-inline-block home--dropdown-width-auto">
                                <div className="input-group-prepend home--dropdown-inline-block">
                                    <span className="input-group-text home--input-text" id="inputGroup-sizing-default">Page Size:</span>
                                </div>
                                <div className="dropdown home--dropdown home--dropdown-inline-block">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="pageSizeDropdown" onClick={this.togglePageSizeDropdown}>
                                        {this.state.pageSizeDropdownString}
                                    </button>
                                    <div className="dropdown-menu home--dropdown-menu" aria-labelledby="pageSizeDropdown" style={{display: (this.state.pageSizeDropdownToggle ? 'block' : 'none')}}>
                                        {this.renderPageSizeDropdown()}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary home--buttton" onClick={this.searchMovies}>Search</button>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="input-group mb-3 home--search-input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text home--input-text" id="inputGroup-sizing-default">Genres:</span>
                                </div>
                                <div className="dropdown">
                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="genresDropdown" onClick={this.toggleGenreDropdown}>
                                        Click to view your Selected Genres
                                    </button>
                                    <div className="dropdown-menu home--dropdown-menu" aria-labelledby="genresDropdown" style={{display: (this.state.genreDropdownToggle ? 'block' : 'none')}}>
                                        {this.renderGenresDropdown()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            <button className="btn btn-primary home--buttton home--page-number-margin" onClick={this.goToPreviousPage} disabled={!this.isPreviousPageButtonClickable()}>Previous Page</button>
                            <p className="home--page-number-margin home--page-number-paragraph">{this.state.searchParams.pageNumber} / {this.state.totalPageCount}</p>
                            <button className="btn btn-primary home--buttton home--page-number-margin" onClick={this.goToNextPage} disabled={!this.isNextPageButtonClickable()}>Next Page</button>
                        </div>
                    </div>
                </div>

                <div className="row home--tile-row">
                    {this.renderMovieTiles()}
                </div>
            </div>
        );
    }
}

export default Home;