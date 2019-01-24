import * as bodyParser from 'body-parser';
import * as logger from 'winston';
import {createConnection} from 'typeorm';
import {User} from './models/entity/User';


const API_PORT = 3001;
const express = require('express');
const app = express();
const router = express.Router();

createConnection().then(async (connection) => {
  console.log("Connected to database");

  let userRepo = connection.getRepository(User);
  let usersCount = await userRepo.count();

  if (usersCount === 0){
    console.log("No Users Exists. Creating admin user.")
    let admin = new User();
    admin.name = "admin";
    admin.id = "admin";
    admin.password = "secret";
    await userRepo.save(admin);
  }

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(require('./controllers'));

}).catch(error => console.log(error));