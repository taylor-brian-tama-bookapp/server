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
const PORT = process.env.PORT;
// DATABASE PORT
const conString = process.env.DATABASE_URL;
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
// ALLOWS EXPRESS TO SERVE STATIC FILES WITHIN PUBLIC DIRECTORY
app.use(express.static('./public'));

// ***  ROUTES  ***


app.listen(PORT, () => {
    console.log(`SERVER started on port ${PORT}`)
});