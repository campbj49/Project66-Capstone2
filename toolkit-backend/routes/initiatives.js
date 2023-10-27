const express = require("express");
const jsonschema = require("jsonschema");
const initiativeSchema = require("../schemas/initiativeSchema.json");
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

router.get("/:id", async function (req, res, next) {
  try {
    const initiative = await Initiative.findOne(res.locals.user.username, req.params.id);
    return res.json({ initiative });
  } catch (err) {
    return next(err);
  }
});

//POST /: accepts array, returns initiative tabe object
router.post("/:id", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, initiativeSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const initiative = await Initiative.rollInitiative(
      res.locals.user.username, 
      req.params.id,
      req.body.rows);
    return res.status(201).json({ initiative });
  } catch (err) {
    return next(err);
  }
});
//POST /kill/:id :removes id from initiative table
//POST /dmg/:id :subtracts passed damage qty from id's hp pool, returns updated value


module.exports = router;
