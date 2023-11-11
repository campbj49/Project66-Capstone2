const express = require("express");
const jsonschema = require("jsonschema");
const encounterSchema = require("../schemas/encounterSchema.json");
const encounterUpdateSchema = require("../schemas/encounterUpdateSchema.json");

const Encounter = require("../models/encounter");
const {ExpressError} = require("../expressError");

const router = new express.Router();


/** GET / => {encounterList: [encounter, ...]} 
 * returns the list of encounterList associated with a user
 */

router.get("/", async function (req, res, next) {
  try {
    const encounterList = await Encounter.findAll(res.locals.user.username);
    return res.json({ encounterList });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {encounter: encounter} */

router.get("/:id", async function (req, res, next) {
  try {
    const encounter = await Encounter.findOne(req.params.id,res.locals.user.username);
    return res.json({encounter});
  } catch (err) {
    return next(err);
  }
});

/** POST /   encounterData => {encounter: newEncounter}
 * adds a new encounter to the logged in user
  */

router.post("/", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, encounterSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const encounter = await Encounter.create(req.body, res.locals.user.username);
    return res.status(201).json({ encounter });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[id]   encounterData => {encounter: updatedEncounter} 
 * Updates an existing encounter
 */

router.put("/:id", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, encounterUpdateSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const encounter = await Encounter.update(req.params.id, req.body,res.locals.user.username);
    console.log(encounter);
    return res.json({ encounter });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]   => {message: "Encounter deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    await Encounter.remove(req.params.id, res.locals.user.username);
    return res.json({ message: "encounter deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
