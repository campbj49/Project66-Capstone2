/** Express app for bookstore. */


const express = require("express");
const app = express();

app.use(express.json());

const ExpressError = require("./expressError")
const bookRoutes = require("./routes/books");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

app.use("/books", bookRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.get("/", async function (req, res, next) {
  try {
    //const books = await Book.findAll(req.query);
    return res.json("{ books }");
  } catch (err) {
    return next(err);
  }
});

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});


/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
