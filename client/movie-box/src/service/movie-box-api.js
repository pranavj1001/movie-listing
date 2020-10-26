import axios from 'axios';

export const searchMovies = (searchObject) => {
    return axios.post('/api/searchmovies', searchObject);
};

export const getGenres = () => {
    return axios.get('/api/getgenres');
};

export const getMovie = (id) => {
    return axios.post('/api/getmovie', {id});
};

export const deleteMovie = (id) => {
    return axios.post('/api/deletemovie', {id});
};

export const saveMovie = (movieObject) => {
    return axios.post('/api/savemovie', movieObject);
}