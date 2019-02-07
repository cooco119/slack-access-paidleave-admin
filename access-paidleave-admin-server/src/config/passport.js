const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport) {
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  passport.use('signup', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true 
    },
    function(req, email, password, done) {
      console.log("handle sign up");
      console.log(req);
      User.findOne({ 'email' : email }, function(err, user) {
          if (err) return done(err);
          if (user) {
              return done(null, false);
          } else {
              var newUser = new User();
              newUser.email = email;
              newUser.password = newUser.generateHash(password); 
              newUser.save(function(err) {
                  if (err)
                      throw err;
                  return done(null, newUser);
              });
          }
      });
  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, email, password, done){
    console.log('handle logging in');
    User.findOne({'email': email}, function(err, user){
      if (err){
        console.log(err);
        return done(err);
      }
      if (!user){
        console.log("No user");
        return done(null, false);
      }
      if (!user.validPassword(password, user.password)){
        console.log("No correct password");
        return done(null, false);
      }
      console.log("Loggin successful!");
      return done(null, user);
    })
  }))
}