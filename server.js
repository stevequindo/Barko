const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require('cors');
const morgan = require('morgan')

const usersRouter = require("./routes/api/users");
const trackingRouter = require("./routes/api/tracking");
const containersRouter = require('./routes/api/containers');

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// Enable cross-origin resource sharing
app.use(cors());

// DB Config
const db = require("./config/keys").mongoURI;

// Log Requests
app.use(morgan('dev'));

// Connect to MongoDB
mongoose
  .connect(
    db,
    {
        useNewUrlParser: true,
        useFindAndModify: false
    }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", usersRouter);
app.use("/api/tracking", trackingRouter);
app.use('/api/containers', containersRouter);


// Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendfile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
