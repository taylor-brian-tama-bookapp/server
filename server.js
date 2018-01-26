'use strict';

//ALLOWS EVERYONE TO VIEW
const cors = require('cors');
// ALLOWS SERVER SIDE JS TO BE EXECUTED
const express = require('express');
// POSTGRES DBMS
const pg = require('pg');
// ALLOWS FOR PARSEING OF INCOMPING API POSTS AND PUTS, MANIPULATES REQ BODY BEFORE IT HITS SERVER
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
//ALLOWS NODE TO INTERACT WITH LOCAL FILES CUS DB IS RUNNING LOCALLY

const conString = 'postgres://localhost:5432/books_app';
// const conString = process.env.DATABASE_URL;
const client = new pg.Client(conString);
// HOW WE CONNECT TO OUR DB
client.connect();

// ***  MIDDLEWARE  ***
// CROSS ORIGIN SCRIPTING
app.use(cors());
// TELLS BODYPARSER TO USE JSON WHEN POSTING AND PUTING DATA INTO DB
app.use(bodyParser.json());
// ALLOWS BODYPARSER TO PARSE NESTED OBJECTS
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('hello');
})
// ROUTES 

app.get('/v1/books', function(req, res) {
    // console.log('app.get /v1/books');
    client.query('SELECT * FROM books;')
    .then(function(data) {
      res.send(data.rows);
    })
    .catch(function(err) {
      console.error(err);
    });
  });

app.get('/v1/books/:book_id', function (req,res) {
  // console.log(req);
  client.query(`SELECT * FROM books WHERE book_id = ${req.params.book_id};`)
  .then(function(data){
    res.send(data.rows);
  })
  .catch(function(err) {
    console.log(err);
  });
});

  
app.post('/v1/books', function(req, res) {
  client.query(
    `INSERT INTO books (title, author, isbn, image_url, description)
    VALUES ($1, $2, $3, $4, $5);
    `,
    [
      req.body.title,
      req.body.author,
      req.body.isbn,
      req.body.image_url,
      req.body.description,
      
    ]
  )
    .then(function(data) {
      res.send('insert complete');
    })
    .catch(function(err) {
      console.error(err);
    });
});

// DELETE
app.delete('/v1/books/:book_id', function(req, res) {
  console.log(req.params.book_id);
    client.query(`DELETE FROM books WHERE book_id=$1`,
     [req.params.book_id]
    )
    .then(() => res.send('Delete complete'))
    .catch(console.error);
});

// UPDATE/PUT
app.put('/v1/books/:book_id/edit', function(req, res) {
  console.log(req.body);
  client.query(`UPDATE * FROM books WHERE book_id = ${req.params.book_id};`)
    .then(() => {
      client.query(`
      UPDATE books
      SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5
      WHERE book_id = $6
      `,
      [
        req.body.title,
        req.body.author,
        req.body.isbn,
        req.body.image_url,
        req.body.description,
        req.params.book_id
      ]
      )
    })
    .then(() => res.send('Update complete'))
    .catch(console.error);
});

createTable();

app.listen(PORT, () => {
    console.log('SERVER started on port:', PORT);
});

function createTable() {
  client.query(`
    CREATE TABLE IF NOT EXISTS books(
      book_id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      author VARCHAR(255),
      isbn VARCHAR(255),
      image_url VARCHAR(255),
      description TEXT NOT NULL
    );`
  )      
};   