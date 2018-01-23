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
// FRONTEND URL
const clientString = process.env.CLIENT_URL;
// ALLOWS USERS TO READ AND WRITE TO DB
const client = new pg.Client(conString);


// HOW WE CONNECT TO OUR DB
client.connect();

// ***  MIDDLEWARE  ***
// TELLS EXPRESS TO USE GZIP COMPRESSION, REDUCES SIZE OF RES BODIES
app.use(compression())
// TELLS BODYPARSER TO USE JSON WHEN POSTING AND PUTING DATA INTO DB
app.use(bodyParser.json());
// ALLOWS BODYPARSER TO PARSE NESTED OBJECTS
app.use(bodyParser.urlencoded({ extended: true }));
// CROSS ORIGIN SCRIPTING
app.use(cors());

// ROUTES 
$.get('/v1/books', (req, res) => {
    console.log('${conString}/v1/books');
    client.query(`
      SELECT * FROM books
      INNER JOIN authors
        ON books.author_id=authors.author_id;`
    )
    .then(result => res.send(result.rows))
    .catch(console.error);
  });
  
$.post('/v1/books', (req, res) => {
    console.log('post route');
    client.query(
    'INSERT INTO authors(author, author_url) VALUES($1, $2) ON CONFLICT DO NOTHING;',
    [req.body.author, req.body.author_url],
    function(err) {
    if (err) console.error(err)
    queryTwo()
    }
)

    function queryTwo() {
        console.log('queryTWo');
        client.query(
          `SELECT author_id FROM authors WHERE author=$1;`,
          [req.body.author],
          function(err, result) {
            if (err) console.error(err)
            queryThree(result.rows[0].author_id)
          }
        )
      }
    
      function queryThree(author_id) {
        console.log('querythree');
        client.query(
          `INSERT INTO
          books(author_id, title, description, isbn, image_url)
          VALUES ($1, $2, $3, $4, $5);`,
          [
            author_id,
            req.body.title,
            req.body.description,
            req.body.isbn,
            req.body.image_url
          ],
          function(err) {
            if (err) console.error(err);
            res.send('insert complete');
          }
        );
      }
    });

loadDB();

app.listen(PORT, () => {
    console.log(`SERVER started on port ${PORT}`)
});

function loadBooks() {
    console.log('loadBooks');
    client.query('SELECT COUNT(*) FROM books;')
        .then(result => {
            if (!parseInt(result.rows[0].count)) {
                fs.readFile(`${clientString}/client/data/books.json`, (err, fd) => {
                    JSON.parse(fd.toString()).forEach(ele => {
                        client.query(`
            INSERT INTO
            books(author_id, title, description, isbn, image_url)
            SELECT author_id, $1, $2, $3, $4
            FROM authors
            WHERE author=$5;
          `,
                            [ele.title, ele.description, ele.isbn, ele.image_url, ele.author]
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
      author_url VARCHAR(255)
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
      image_url VARCHAR(255)
    );`
    )
        .then(loadBooks)
        .catch(console.error);
}