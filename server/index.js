const keys = require('./keys');
const constants = require('./string-constants');

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
pgClient.connect((err, client, release) => {
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
    client.query(constants.PG_DB_INIT_FUNCTION, (err, result) => {
        release();
        if (err) {
            return console.error('Error Creating Function', err.stack);
        }
    });
});
// Postgres Client Setup ends ---------------

// Express Route Handlers starts ---------------
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.listen(5000, error => {
    console.log(constants.LISTENING_ON_PORT_MESSAGE);
});
// Express Route Handlers ends ---------------
