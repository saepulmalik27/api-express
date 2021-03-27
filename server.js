const express = require("express");
const app = express();
const mongoose = require("mongoose");

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// connect to mongodb
mongoose
  .connect("mongodb://localhost:27017/", {
    dbName: "mongobasic",
     useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connect to db"))
  .catch((err) => console.log(err));
// mongoose.connect('mongodb://localhost:27017/', {
//     dbName: 'mongobasic',
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, err => err ? console.log(err) : console.log('Connected to database'));

app.get("/", (req, res) => {
  res.send({ name: "saepul", addrress: "bogor" });
});

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`running at port ${port}`));
