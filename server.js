const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json());
// connect to mongodb
mongoose
  .connect("mongodb://localhost:27017/", {
    dbName: "mongobasic",
     useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connect to db"))
  .catch((err) => console.log(err));

// passport middleware
  app.use(passport.initialize());
  require('./config/passport')(passport);

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`running at port ${port}`));
