import * as bodyParser from 'body-parser';
import * as logger from 'winston';
import AccessHandler from './access_handler';
import PaidleaveHandler from './paidleave_handler';
const express = require('express');
const proxy = require('express-http-proxy');
const http = require('http');
const https = require('https');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// @ts-ignore
app.get('/access?', cors(), (req, res) => {
  (new AccessHandler()).handle(req.query)
  .then( response => {
    console.log(response);
    res.json(response);
  })
})
// @ts-ignore
app.get('/paidleave?', cors(), (req, res) => {
  console.log(req.query);
  (new PaidleaveHandler()).handle(req.query)
  .then(response => {
    console.log(response);
    res.status(200).json(response);
  })
})

http.createServer(app).listen(port, () => {
  console.log(`API server listening on port ${port}`);
})