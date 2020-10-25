const keys = require('./keys');
const constants = require('./string-constants');
const populateData = require('./imdb.json');
const fs = require('fs');

// Express App Setup starts ---------------
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Express App Setup ends ---------------

// Postgres Client Setup starts ---------------
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHOST,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', () => console.log(constants.LOST_PG_CONNECTION_MESSAGE));

pgClient.connect(async (err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack)
    }
    client.query(constants.PG_DB_INIT_TABLE, (err, result) => {
        if (err) {
            return console.error('Error Creating Tables', err.stack);
        }
    });
    client.query(constants.CREATE_UUID_OOSP, (err, result) => {
        if (err) {
            return console.error('Error Creating Extension', err.stack);
        }
    });
    const isDataPopulated = fs.readFileSync('./IsDataPopulated.txt', encoding = 'utf8');
    client.query(constants.PG_DB_INIT_FUNCTION, (err, result) => {
        if (isDataPopulated === 'true') {
            release();
        }
        if (err) {
            return console.error('Error Creating Function', err.stack);
        }
    });
    
    if (isDataPopulated === 'false') {
        console.log("Populating DataBase.");
        let i = 0;
        const pushedMovies = [];
        while (i < populateData.length) {
            const result = await client.query('select save_movie($1::uuid, $2, $3, $4::int, $5::numeric, $6, $7, $8, $9::text[])', 
            [
                null, 
                populateData[i].name.trim(), 
                populateData[i].director.trim(), 
                populateData[i]["99popularity"], 
                populateData[i].imdb_score, 
                'admin@admin.com', 
                'admin@admin.com', 
                '000000', 
                populateData[i].genre.map((value) => value.trim())
            ]);
            if (result.rows[0].save_movie.status === 0) {
                pushedMovies.push(result.rows[0].save_movie.data.movieId);
            }
            i++;
        }
        console.log(`Populated DataBase with ${pushedMovies.length} entries.`);
        fs.writeFileSync('./IsDataPopulated.txt', 'true');
        release();
    }
});
// Postgres Client Setup ends ---------------

// Express Route Handlers starts ---------------
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/getgenres', async (req, res) => {
    const values = await pgClient.query('select get_genres()', []);
    res.send(values.rows[0].get_genres);
});

app.post('/getmovie', async (req, res) => {
    if (req.body.id !== null && req.body.id.trim() === '') {
        req.body.id = null;
    }
    const values = await pgClient.query('select get_movie($1)', [req.body.id]);
    res.send(values.rows[0].get_movie);
});

app.post('/deletemovie', async (req, res) => {
    if (req.body.id !== null && req.body.id.trim() === '') {
        req.body.id = null;
    }
    const values = await pgClient.query('select delete_movie($1)', [req.body.id]);
    res.send(values.rows[0].delete_movie);
});

app.post('/savemovie', async (req, res) => {
    if (req.body.movieId !== null && req.body.movieId.trim() === '') {
        req.body.movieId = null;
    }
    const { movieId, movieName, director, popularity, score, createdBy, lastModifiedBy, createdByGoogleUserId, genreList } = req.body;
    const values = await pgClient.query('select save_movie($1::uuid, $2, $3, $4::int, $5::numeric, $6, $7, $8, $9::text[])', 
    [movieId, movieName, director, popularity, score, createdBy, lastModifiedBy, createdByGoogleUserId, genreList]);
    res.send(values.rows[0].save_movie);
});

app.post('/searchmovies', async (req, res) => {
    const { searchTerm, sortBy, sortOrder, genreList, pageSize, pageNumber, ignoreGenres } = req.body;
    const values = await pgClient.query('select search_movies($1, $2, $3, $4::uuid[], $5::integer, $6::integer, $7::bool)', 
    [searchTerm, sortBy, sortOrder, genreList, pageSize, pageNumber, ignoreGenres]);
    res.send(values.rows[0].search_movies);
});

app.listen(5000, error => {
    console.log(constants.LISTENING_ON_PORT_MESSAGE);
});
// Express Route Handlers ends ---------------
