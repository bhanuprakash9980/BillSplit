const express = require('express');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
require('dotenv').config();
/**
 * ===================================
 * Configurations and set up
 * ===================================
 */
// Init express app
const app = express();
// Set up middleware
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// Set react-views to be the default view engine
const reactEngine = require('express-react-views').createEngine();

app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactEngine);
const format = require('pg-format');

var multer = require('multer');
var upload = multer({
  dest: './uploads/',
});
var cloudinary = require('cloudinary');

var configForCloudinary;

if (process.env.CLOUDINARY_URL) {
  configForCloudinary = process.env.CLOUDINARY_URL;
} else {
  configForCloudinary = {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  };
}
cloudinary.config(configForCloudinary);

/**
 * ===================================
 * ===================================
 *                DB
 * ===================================
 * ===================================
 */

// db contains *ALL* of our models
const allModels = require('./db');

/**
 * ===================================
 * ===================================
 * Routes
 * ===================================
 * ===================================
 */

// get the thing that contains all the routes
const setRoutesFunction = require('./routes');

// call it and pass in the "app" so that we can set routes on it (also models)
setRoutesFunction(app, allModels);

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log('~~~ Tuning in to the waves of port ' + PORT + ' ~~~')
);

let onClose = function () {
  server.close(() => {
    console.log('Process terminated');
    allModels.pool.end(() => console.log('Shut down db connection pool'));
  });
};

process.on('SIGTERM', onClose);
process.on('SIGINT', onClose);
