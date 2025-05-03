var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var path = require('path');
const methodOverride = require('method-override');
// const productRoutes = require('./routes/products');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env

var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var memberRouter = require('./routes/member');
// var customerRouter = require('./routes/customer');
// var authRouter = require('./routes/auth');
var coffeeRouter = require('./routes/coffees');
var snackRouter = require('./routes/snacks');
var commentRouter = require('./routes/customer');
var searchRouter = require('./routes/search');
var orderRouter = require('./routes/orders');

const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/mydrink',{
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

const mongoUser = process.env.MONGOOSE_USER;
const mongoPass = process.env.MONGOOSE_PASS;
mongoose.connect(`mongodb+srv://${mongoUser}:${mongoPass}@cluster0.peze6.mongodb.net/drink?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(logger('dev'));
app.use(methodOverride('_method'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware for parsing JSON data
app.use(cors());
app.use(bodyParser.json())

// Middleware for parsing URL-encoded data (from forms)
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    //should be place before router
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } //1 day
  })
);

// Middleware to pass user to response locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// *** Define routes here
app.use('/', require('./routes'));

app.use('/', indexRouter);

app.use('/users', usersRouter);
app.use('/member', memberRouter);

app.use('/coffees', coffeeRouter); //Coffee route
app.use('/snacks', snackRouter);  //Snack route
app.use('/customer', commentRouter);
app.use('/search', searchRouter);
app.use(express.static('public')); // Serve static files from public directory
//Serve static files from public directory

app.use('/images', express.static(path.join(__dirname, 'mydrink', 'public')));
app.use('/orders', orderRouter);

// app.get('/', (req, res) => {
//   if (!req.session) {
//     console.log('Session not created!');
//     res.render('index', { req });
//   } else {
//     console.log('Route session:', req.session);
//     req.session.visits = (req.session.visits || 0) + 1; // Track visits for debugging
//     console.log('Number of visits:', req.session.visits);
//     res.render('index', { req });
//   }
// });


// Home Route
app.get('/', (req, res) => {
  // res.render('index'); 
  // console.log('Route session:', req.session); // Debugging log
  // session = req.session
  res.render('index');  // Pass req explicitly
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
