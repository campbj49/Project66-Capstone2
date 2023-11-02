/** Express app for Dungeon Master toolkit. */

const {ExpressError} = require("./expressError");
const { ensureLoggedIn, authenticateJWT } = require("./middleware/auth");
const initiativeRoutes = require("./routes/initiatives");
const initiativeEntityRoutes = require("./routes/initiativeEntities");
const encounterRoutes = require("./routes/encounters");
const randomEncounterTableRoutes = require("./routes/randomEncounterTables")
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");


const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use(authenticateJWT);
app.use("/initiatives", ensureLoggedIn, initiativeRoutes);
app.use("/ies", ensureLoggedIn, initiativeEntityRoutes);
app.use("/encounters", ensureLoggedIn, encounterRoutes);
app.use("/ret", ensureLoggedIn, randomEncounterTableRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.get("/", async function (req, res, next) {
  try {
    //const initiativeEntities = await Book.findAll(req.query);
    return res.json({ initiativeEntities:"This has been updated and again" });
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
