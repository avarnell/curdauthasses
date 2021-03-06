var express = require('express');
var router = express.Router();
var db = require('monk')('localhost/studentTracker')
var Users = db.get('userCollection')
var bcrypt = require('bcrypt')
var Students = db.get('studentsCollection')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Uncle Andys Student Manager', user : req.session.user });
});

router.get('/register', function(req,res,next){
  res.render('register', { user : req.session.user})
})

router.get('/login', function(req,res,next){

  res.render('login', {user : req.session.user})
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

router.post('/login', function(req,res,next){
  var errors = []
  if(!req.body.password || !req.body.email){
    errors.push('Both Email and Password required.')
    res.render('login', {errors:errors})
  }else{
    Users.findOne({email: req.body.email}, function(error,data){
      if(!data){
        errors.push('That user does not exist')
        res.render('login', {errors:errors})
      } else{
        if(bcrypt.compareSync(req.body.password, data.passHash)){
          req.session.user = data.email
          res.redirect('/')
        }else{
          errors.push('Incorrect Password')
          res.render('login', {errors:errors})
        }
      }
    })
  }
})

router.get('/add', function(req,res,next){
  var errors = []
  if(req.session.user){
    res.render('add', {user : req.session.user})
  }else{
    errors.push('You must be signed in to access that page')
    res.render('login', {errors: errors})
  }
})

router.post('/add', function(req,res,next){
  var errors = []
  if(!req.body.studentName || !req.body.studentNumber){
    errors.push('Both Fields are required')
    res.render('add', {user : req.session.user, errors:errors})
  }
  else{
    Students.insert({
      studentName : req.body.studentName,
      studentNumber : req.body.studentNumber
    },function(error,data){
      res.redirect('/view')
    })
  }
})

router.get('/view',function(req,res,next){
  var errors = []
  if(req.session.user){
    Students.find({},function(err,data){
      res.render('view', {user : req.session.user, students : data})
    })

    
  }else{
    errors.push('You must be signed in to access that page')
    res.render('login', {errors: errors})
  }
})

router.get('/logout', function(req,res,next){
  req.session = null
  res.redirect('/')
})

router.get('/view/:id',function(req,res,next){
  var errors = []
  if(req.session.user){
    Students.findById(req.params.id, function(err,data){
      res.render('viewOne', {user : req.session.user, student : data})
    })

    
  }else{
    errors.push('You must be signed in to access that page')
    res.render('login', {errors: errors})
  }
})

module.exports = router;
