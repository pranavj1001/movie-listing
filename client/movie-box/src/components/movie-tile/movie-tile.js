import React, { Component } from 'react';
import { Link } from "react-router-dom";

import './movie-tile.css';

class MovieTile extends Component {

    render() {
        return (
            <Link to={this.props.data.link} className="movie-tile--link">
                <div className="movie-tile--main-div" style={{backgroundColor: this.props.data.color}}>
                    <p className="movie-tile--paragraph movie-tile--paragraph-heading">Title: {this.props.data.name}</p>
                    <p className="movie-tile--paragraph movie-tile--paragraph-content">Director: {this.props.data.director}</p>
                    <p className="movie-tile--paragraph movie-tile--paragraph-content">Popularity: {this.props.data.popularity}</p>
                    <p className="movie-tile--paragraph movie-tile--paragraph-content">Score: {this.props.data.score}</p>
                    <p className="movie-tile--paragraph movie-tile--paragraph-click-message">{this.props.data.clickMessage}</p>
                </div>
            </Link>
        );
    }
}

export default MovieTile;