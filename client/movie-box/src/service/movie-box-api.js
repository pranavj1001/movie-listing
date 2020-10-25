import axios from 'axios';

export const searchMovies = (searchObject) => {
    return axios.post('/api/searchmovies', searchObject);
};

export const getGenres = () => {
    return axios.get('/api/getgenres');
};