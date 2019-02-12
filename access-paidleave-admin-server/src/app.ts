import * as bodyParser from 'body-parser';
import * as logger from 'winston';
import AccessHandler from './access_handler';
import PaidleaveHandler from './paidleave_handler';
const express = require('express');
const proxy = require('express-http-proxy');
const http = require('http');
const https = require('https');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017');
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection err.'));
//@ts-ignore
db.once('open', function(callback){
  console.log("mongoDB connected");
})
require('./config/passport')(passport);

const front_url = "192.168.101.198:8080/main";
const front_url_entry = "192.168.101.198:8080/login";
const api_url = "192.168.101.198:8000";

const app = express();
const port = 8000;

app.use(cors({credentials: true, origin: 'http://192.168.101.198'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(history());

//@ts-ignore
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    console.log("Authed!");
    return next();
  }
  console.log("Authed failed!");
  setTimeout(() => {
    //@ts-ignore
    return res.json(401, {message: 'not found'});
  }, 100);
}

//@ts-ignore
app.get('/history/access', (req, res) => {
  const data = req.query;
  (new AccessHandler()).history(data)
  .then( response => {
    // @ts-ignore
    console.log(response);
    res.status(200).json(response);
  })
  // @ts-ignore
  .catch(e => {
    console.error(e);
    res.status(404).json(e);
  });
});

// @ts-ignore
app.post('/history/modify', (req, res) => {
  const data = req.body;
  if (data.scope === 'access'){
    (new AccessHandler()).modify(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else if (data.scope === 'paidleave'){
    (new PaidleaveHandler()).modify(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else {
    res.status(400).status({"error": "Bad request", "msg": "Not a defined scope"});
  }
})

// @ts-ignore
app.post('/history/remove', (req, res) => {
  const data = req.body;
  console.log(data);
  if (data.scope === 'access'){
    (new AccessHandler()).remove(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else if (data.scope === 'paidleave'){
    (new PaidleaveHandler()).remove(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else {
    res.status(400).status({"error": "Bad request", "msg": "Not a defined scope"});
  }
})

// @ts-ignore
app.post('/insert', (req, res) => {
  const data = req.body;
  if (data.scope === 'access'){
    (new AccessHandler()).insert(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else if (data.scope === 'paidleave'){
    (new PaidleaveHandler()).insert(data)
    .then( response => {
      // @ts-ignore
      console.log(response);
      res.status(200).json(response);
    })
    // @ts-ignore
    .catch(e => {
      console.error(e);
      res.status(404).json(e);
    });
  }
  else {
    console.log("Unknown scope");
    res.status(404).json({"msg": "Unknown scope"});
  }
});

// @ts-ignore
app.get('/access', (req, res) => {
  (new AccessHandler()).handle(req.query)
  .then( response => {
    console.log(response);
    res.json(response);
  })
})
// @ts-ignore
app.get('/paidleave', (req, res) => {
  console.log(req.query);
  (new PaidleaveHandler()).handle(req.query)
  .then(response => {
    console.log(response);
    res.status(200).json(response);
  })
  // @ts-ignore
  .catch(e => {
    console.error(e);
    res.status(404).json(e);
  });
})

http.createServer(app).listen(port, () => {
  console.log(`API server listening on port ${port}`);
})

const port_proxy = 80;
const app_proxy = express();

const flash = require('connect-flash');
app_proxy.use(cors({credentials: true, origin: 'http://192.168.101.198'}));
app_proxy.use(bodyParser.urlencoded({ extended: false }));
app_proxy.use(bodyParser.json());
app_proxy.use(history());
app_proxy.use(flash());
app_proxy.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app_proxy.use(passport.initialize());
app_proxy.use(passport.session());

app_proxy.use('/api/v1', isLoggedIn, proxy(api_url));

app_proxy.post('/login', passport.authenticate('login', {
  successRedirect: 'http://192.168.101.198/main',
  faliureRedirect: 'http://192.168.101.198/login',
  failureFlash: false
  //@ts-ignore
}), (req, res) => {
  req.session.save(() => {
    console.log(req.session);
    console.log(req.isAuthenticated());
    res.redirect('/');
    res.json(200, "Login successful");
  })
});
//@ts-ignore
app_proxy.post('/logout', (req, res) => {
  console.log("logout");
  console.log(req.session);
  req.logout();
  res.json(200, "Successful");
});
app_proxy.post('/signup', passport.authenticate('signup', {
  successRedirect: front_url + '/main',
  faliureRedirect: front_url_entry,
  failureFlash: false
}));

//@ts-ignore
function passToFront(req, res, next){
  console.log("Passing to front");
  console.log(req);
  return next();
}

app_proxy.use('/main', proxy(front_url));
app_proxy.use('/', proxy(front_url));


http.createServer(app_proxy).listen(port_proxy, () => {
  console.log(`Proxy server listening on port ${port_proxy}`);
})