const express = require("express");
const jsonschema = require("jsonschema");
const playerCharacterSchema = require("../schemas/playerCharacterSchema.json");

const PlayerCharacter = require("../models/playerCharacter");
const {ExpressError} = require("../expressError");

const router = new express.Router();


/** GET / => {playerCharacters: [playerCharacter, ...]} 
 * returns the list of PCs associated with a user
 */

router.get("/", async function (req, res, next) {
  try {
    const playerCharacters = await PlayerCharacter.findAll(res.locals.user.username);
    return res.json({ playerCharacters });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {playerCharacter: playerCharacter} */

router.get("/:id", async function (req, res, next) {
  try {
    const playerCharacter = await PlayerCharacter.findOne(req.params.id,res.locals.user.username);
    return res.json({playerCharacter});
  } catch (err) {
    return next(err);
  }
});

/** POST /   playerCharacterData => {playerCharacter: newPlayerCharacter}
 * adds a new PC to the logged in user
  */

router.post("/", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, playerCharacterSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const playerCharacter = await PlayerCharacter.create(req.body, res.locals.user.username);
    return res.status(201).json({ playerCharacter });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[id]   playerCharacterData => {playerCharacter: updatedPlayerCharacter} 
 * Updates an existing PC
 */

router.put("/:id", async function (req, res, next) {
  try {
    //use validation example from API Validation note sheet
    const result = jsonschema.validate(req.body, playerCharacterSchema);
  
    if (!result.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
  
    // at this point in code, we know we have a valid payload
    const playerCharacter = await PlayerCharacter.update(req.params.id, req.body,res.locals.user.username);
    return res.json({ playerCharacter });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]   => {message: "PlayerCharacter deleted"} */

router.delete("/:id", async function (req, res, next) {
  try {
    await PlayerCharacter.remove(req.params.id, res.locals.user.username);
    return res.json({ message: "PlayerCharacter deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
