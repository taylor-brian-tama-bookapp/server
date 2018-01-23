'use strict';

//ALLOWS NODE TO INTERACT WITH LOCAL FILES CUS DB IS RUNNING LOCALLY
const fs = require('fs');
// GZIP COMPRESSION CAN GREATLY DECREASE THE SIZE OF THE RESPONSE BODY
const compression = require('compression')
// ALLOWS SERVER SIDE JS TO BE EXECUTED
const express = require('express');
const app = express();
// POSTGRES DBMS
const pg = require('pg');
// ALLOWS FOR PARSEING OF INCOMPING API POSTS AND PUTS, MANIPULATES REQ BODY BEFORE IT HITS SERVER
const bodyParser = require('body-parser');
// THE PORT WE RUN OUR SERVER ON
const cors = require('cors');
//ALLOWS EVERYONE TO VIEW
const PORT = process.env.PORT;
// DATABASE PORT
const conString = process.env.DATABASE_URL;
// ALLOWS USERS TO READ AND WRITE TO DB
const client = new pg.Client(conString);
const clientURL = 'https://taylor-brian-tama-bookapp.github.io';

// HOW WE CONNECT TO OUR DB
client.connect();

// ***  MIDDLEWARE  ***
// TELLS EXPRESS TO USE GZIP COMPRESSION, REDUCES SIZE OF RES BODIES
app.use(compression())
// TELLS BODYPARSER TO USE JSON WHEN POSTING AND PUTING DATA INTO DB
app.use(bodyParser.json());
// ALLOWS BODYPARSER TO PARSE NESTED OBJECTS
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// ***  ROUTES  ***
app.listen(PORT, () => {
    console.log(`SERVER started on port ${PORT}`)
});

function loadBooks() {
    console.log('loadBooks');
    client.query('SELECT COUNT(*) FROM books')
        .then(result => {
            if (!parseInt(result.rows[0].count)) {
                fs.readFile(`${clientURL}./client/data/books.json`, (err, fd) => {
                    JSON.parse(fd.toString()).forEach(ele => {
                        client.query(`
            INSERT INTO
            books(author_id, title, description, isbn, imageURL)
            SELECT author_id, $1, $2, $3, $4
            FROM authors
            WHERE author=$5;
          `,
                            [ele.title, ele.description, ele.isbn, ele.imageURL, ele.author]
                        )
                            .catch(console.error);
                    })
                })
            }
        })
}

function loadDB() {
    console.log('loaddb');
    client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR(255)
    );`
    )
        .then(loadAuthors)
        .catch(console.error);

    client.query(`
    CREATE TABLE IF NOT EXISTS
    books (
      book_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      isbn VARCHAR(255),
      imageURL
      body TEXT NOT NULL
    );`
    )
        .then(loadBooks)
        .catch(console.error);
}