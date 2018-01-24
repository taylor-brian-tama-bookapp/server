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
const PORT = process.env.PORT;
//ALLOWS NODE TO INTERACT WITH LOCAL FILES CUS DB IS RUNNING LOCALLY
const fs = require('fs');


const conString = process.env.DATABASE_URL;
//const CLIENT_URL = process.env.CLIENT_URL;
const CLIENT_URL = 'https://taylor-brian-tama-bookapp.github.io/client';
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
    console.log('app.get /v1/books');
    client.query('SELECT * FROM books;')
    .then(function(data) {
      res.send(data.rows);
    })
    .catch(function(err) {
      console.error(err);
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

function loadBooks() {
  client.query('SELECT COUNT(*) FROM books')
    .then(res => {
      if(!parseInt(res.rows[0].count)) {
        fs.readFile(`${CLIENT_URL}/data/books.json`, (err, fd) => {
          JSON.parse(fd.toString().forEach(ele => {
            client.query(
              `INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;`,
              [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
            )
              .catch(console.error);
          })
        )
        })
      }
    })
}
  
  
  
  
//   fs.readFile(`${CLIENT_URL}/data/books.json`, function(err, fd) {
//     JSON.parse(fd.toString()).forEach(function(ele) {
//       client.query(
//         `INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;`,
//         [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
//       )
//     })
//   })
//  }  

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
  .then(loadBooks());
  
};