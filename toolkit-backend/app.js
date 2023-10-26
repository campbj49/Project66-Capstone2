/** Express app for Dungeon Master toolkit. */


const express = require("express");
const app = express();

app.use(express.json());

const {ExpressError} = require("./expressError");
const { ensureLoggedIn, authenticateJWT } = require("./middleware/auth");
const initiativeRoutes = require("./routes/initiatives");
const initiativeEntityRoutes = require("./routes/initiativeEntities");
const encounterRoutes = require("./routes/encounters");
const randomEncounterTableRoutes = require("./routes/randomEncounterTables")
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

app.use("/initiatives", authenticateJWT, ensureLoggedIn, initiativeRoutes);
app.use("/ies", authenticateJWT, ensureLoggedIn, initiativeEntityRoutes);
app.use("/encounters", authenticateJWT, ensureLoggedIn, encounterRoutes);
app.use("/ret", authenticateJWT, ensureLoggedIn, randomEncounterTableRoutes);
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
