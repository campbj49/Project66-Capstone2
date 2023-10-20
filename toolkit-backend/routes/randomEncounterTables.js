const express = require("express");
const jsonschema = require("jsonschema");
const randomEncounterTableSchema = require("../schemas/randomEncounterTableSchema.json");

const RandomEncounterTable = require("../models/randomEncounterTable");
const {ExpressError} = require("../expressError");

const router = new express.Router();


/** GET / => {randomEncounterTables: [randomEncounterTable, ...]} 
 * returns the list of IEs associated with a user
 */

router.get("/", async function (req, res, next) {
  try {
    const randomEncounterTables = await RandomEncounterTable.findAll(res.locals.user.username);
    return res.json({ randomEncounterTables });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {randomEncounterTable: randomEncounterTable} */

router.get("/:id", async function (req, res, next) {
  try {
    const randomEncounterTable = await RandomEncounterTable.findOne(req.params.id,res.locals.user.username);
    return res.json({randomEncounterTable});
  } catch (err) {
    return next(err);
  }
});

/** POST /   randomEncounterTableData => {randomEncounterTable: newRandomEncounterTable}
 * adds a new IE to the logged in user
  */

router.post("/", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, randomEncounterTableSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const randomEncounterTable = await RandomEncounterTable.create(req.body, res.locals.user.username);
    return res.status(201).json({ randomEncounterTable });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[id]   randomEncounterTableData => {randomEncounterTable: updatedRandomEncounterTable} 
 * Updates an existing IE
 */

router.put("/:id", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, randomEncounterTableSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const randomEncounterTable = await RandomEncounterTable.update(req.params.id, req.body,res.locals.user.username);
    return res.json({ randomEncounterTable });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]   => {message: "RandomEncounterTable deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    await RandomEncounterTable.remove(req.params.id, res.locals.user.username);
    return res.json({ message: "RandomEncounterTable deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
