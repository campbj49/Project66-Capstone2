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

//GET /:id retrievs current user's initiative table
router.get("/:id", async function (req, res, next) {
  try {
    const initiative = await Initiative.findOne(res.locals.user.username, req.params.id);
    return res.json({ initiative });
  } catch (err) {
    return next(err);
  }
});

//GET /:id/next retrieves character card for next active entity
router.get("/:id/next", async function (req, res, next) {
  try {
    const entity = await Initiative.nextEntity(res.locals.user.username, req.params.id);
    return res.json({ entity });
  } catch (err) {
    return next(err);
  }
});

//POST /: accepts array, returns initiative table object
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

//PUT :id/kill :removes id from initiative table
router.put("/:id/kill", async function (req, res, next) {
  try {
    const initiative = await Initiative.kill(
      res.locals.user.username, 
      req.params.id,
      req.body.entityIds);
    return res.status(201).json({ initiative });
  } catch (err) {
    return next(err);
  }
} );

//PUT :id/dmg :subtracts passed damage qty from id's hp pool, returns updated value
router.put("/:id/dmg", async function (req, res, next) {
  try {
    const initiative = await Initiative.damage(
      res.locals.user.username, 
      req.params.id,
      req.body);
    return res.status(201).json({ initiative });
  } catch (err) {
    return next(err);
  }
} );

//DELETE /:id :clears rows of encounter specified
router.delete("/:id", async function (req, res, next) {
  try {
    await Initiative.exitCombat(res.locals.user.username, req.params.id);
    return res.json({ message: "Initiative Cleared" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
