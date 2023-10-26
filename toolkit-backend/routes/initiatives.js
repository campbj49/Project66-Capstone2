const express = require("express");
const jsonschema = require("jsonschema");
//const initiativeSchema = require("../schemas/initiativeSchema.json");
//const initiativeUpdateSchema = require("../schemas/initiativeUpdateSchema.json");

const Initiative = require("../models/initiative");
const {ExpressError} = require("../expressError");

const router = new express.Router();


/** GET / => {initiatives: [initiative, ...]} 
 * returns the list of initiatives associated with a user
 */

router.get("/", async function (req, res, next) {
  try {
    const initiatives = await Initiative.findAll(res.locals.user.username);
    return res.json({ initiatives });
  } catch (err) {
    return next(err);
  }
});

//GET /: retrievs current user's initiative table
//POST /: accepts array, returns initiative tabe object
//POST /kill/:id :removes id from initiative table
//POST /dmg/:id :subtracts passed damage qty from id's hp pool, returns updated value


module.exports = router;
