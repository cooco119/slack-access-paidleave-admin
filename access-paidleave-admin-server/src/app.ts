import * as bodyParser from 'body-parser';
import * as logger from 'winston';
import AccessHandler from './access_handler';
import PaidleaveHandler from './paidleave_handler';
const express = require('express');
const proxy = require('express-http-proxy');
const http = require('http');

const API_PORT = 8000;
const app = express();
const port = 8000;
const front_url = "localhost:8080"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// @ts-ignore
app.get('/api/v1/access?', (req, res) => {
  (new AccessHandler()).handle(req.query)
  .then( response => {
    console.log(response);
    res.status(200).json(response);
  })
})
// @ts-ignore
app.get('/api/v1/paidleave?', (req, res) => {
  console.log(req.query);
  (new PaidleaveHandler()).handle(req.query)
  .then(response => {
    console.log(response);
    res.status(200).json(response);
  })
})
app.use('/', proxy(front_url));

http.createServer(app).listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
})