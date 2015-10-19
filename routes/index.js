var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/studentTracker')
var Users = db.get('userCollection')
var bcrypt = require('bcrypt')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Uncle Andys Student Manager' });
});

router.get('/register', function(req,res,next){
  res.render('register')
})

router.get('/login', function(req,res,next){
  res.render('login')
})

router.post('/register', function(req,res,next){
  var errors = []
  if(!req.body.email || !req.body.password || !req.body.retype){
    errors.push('all fields are required')
    res.render('register', {errors:errors})
  } else if(req.body.password !== req.body.retype) {
    errors.push('Passwords do not match!')
    res.render('register', {errors:errors})
  } else{
    Users.findOne({userEmail : req.body.email}, function(err, data){
      if(data){
        errors.push('that user already exists')
        res.render('register', {errors:errors})
      } else {
        var hash = bcrypt.hashSync(req.body.password, 10)
        Users.insert({
          email : req.body.email,
          passHash : hash
        },function(error,data){
          res.redirect('/login')
        })
      }
    })
  }
})


module.exports = router;
