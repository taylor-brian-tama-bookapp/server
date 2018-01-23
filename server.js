'use strict';

//ALLOWS NODE TO INTERACT WITH LOCAL FILES CUS DB IS RUNNING LOCALLY
const fs = require('fs');
// GZIP COMPRESSION CAN GREATLY DECREASE THE SIZE OF THE RESPONSE BODY
//const compression = require('compression')
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
//const conString = 'postgres://localhost:5432/books_app';
// FRONTEND URL
//const CLIENT_URL = process.env.CLIENT_URL;
const CLIENT_URL = 'https://taylor-brian-tama-bookapp.github.io/client';
const client = new pg.Client(conString);


// HOW WE CONNECT TO OUR DB
client.connect();

// ***  MIDDLEWARE  ***
// TELLS EXPRESS TO USE GZIP COMPRESSION, REDUCES SIZE OF RES BODIES
//app.use(compression())
// TELLS BODYPARSER TO USE JSON WHEN POSTING AND PUTING DATA INTO DB
app.use(bodyParser.json());
// ALLOWS BODYPARSER TO PARSE NESTED OBJECTS
app.use(bodyParser.urlencoded({ extended: true }));
// CROSS ORIGIN SCRIPTING
app.use(cors());


app.get('/', (req, res) => {
    res.send('hello');
})
// ROUTES 
app.get('/v1/books', (req, res) => {
    console.log('${conString}/v1/books');
    client.query(`
      SELECT * FROM books;
      `
    )
    .then(result => res.send(result.rows))
    .catch(console.error);
  });
  
  
  app.post('/v1/books', (req, res) => {
   
    client.query(
      `INSERT INTO
      books (title, author, isbn, image_url, description)
      VALUES ($1, $2, $3, $4, $5);
      `,
      [
        request.body.title,
        request.body.author,
        request.body.isbn,
        request.body.image_url,
        request.body.description,
        
      ]
    )
      .then(function() {
        response.send('insert complete')
      })
      .catch(function(err) {
        console.error(err);
      });
  });
    

loadDB();

app.listen(PORT, () => {
    console.log('SERVER started on port:', PORT);
});

function loadBooks() {
    fs.readFile(`${CLIENT_URL}/data/books.json`, function(err, fd) {
      JSON.parse(fd.toString()).forEach(function(ele) {
        client.query(
          'INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;',
          [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
        )
      })
    })
   }
   
   function loadDB() {
    client.query(`
      CREATE TABLE IF NOT EXISTS
      books(id SERIAL PRIMARY KEY, title VARCHAR(255), author VARCHAR(255), isbn VARCHAR(255), image_url VARCHAR(255), description TEXT NOT NULL);
      `)
   
      .then(loadBooks());
   }

