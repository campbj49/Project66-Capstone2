const express = require("express");
const jsonschema = require("jsonschema");
const initiativeEntitySchema = require("../schemas/initiativeEntitySchema.json");
const ieUpdateSchema = require("../schemas/ieUpdateSchema.json")

const InitiativeEntity = require("../models/initiativeEntity");
const {ExpressError} = require("../expressError");

const router = new express.Router();


/** GET / => {initiativeEntities: [initiativeEntity, ...]} 
 * returns the list of IEs associated with a user
 */

router.get("/", async function (req, res, next) {
  try {
    const initiativeEntities = await InitiativeEntity.findAll(res.locals.user.username);
    return res.json({ initiativeEntities });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {initiativeEntity: initiativeEntity} */

router.get("/:id", async function (req, res, next) {
  try {
    const initiativeEntity = await InitiativeEntity.findOne(req.params.id,res.locals.user.username);
    return res.json({initiativeEntity});
  } catch (err) {
    return next(err);
  }
});

/** POST /   initiativeEntityData => {initiativeEntity: newInitiativeEntity}
 * adds a new IE to the logged in user
  */

router.post("/", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, initiativeEntitySchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const initiativeEntity = await InitiativeEntity.create(req.body, res.locals.user.username);
    return res.status(201).json({ initiativeEntity });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[id]   initiativeEntityData => {initiativeEntity: updatedInitiativeEntity} 
 * Updates an existing IE
 */

router.put("/:id", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, ieUpdateSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const initiativeEntity = await InitiativeEntity.update(req.params.id, req.body,res.locals.user.username);
    return res.json({ initiativeEntity });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]   => {message: "InitiativeEntity deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    await InitiativeEntity.remove(req.params.id, res.locals.user.username);
    return res.json({ message: "InitiativeEntity deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
