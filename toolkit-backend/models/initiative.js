
const db = require("../db");
const { sqlForPartialUpdate, sqlResToJs, sqlArrToJs } = require("../helpers/sql");


/** Collection of related methods for managing initiative*/

class Initiative {
    //for the GET routes, do I want the option to get a full list? I don't see why not,
    //it can just pull up the encounter ID & maybe the number of creatures participating/turn count
    static async findAll(username){
        const initiativesList = await db.query(
            `SELECT e.id, e.description, COUNT(*) AS creature_count FROM initiative
            INNER JOIN encounters AS e ON initiative.encounter_id = e.id
            WHERE e.owner_username = $1
            GROUP BY e.id`,
            [
                username
            ]
        );
        return sqlArrToJs(initiativesList.rows);
    }
    //GET for an individual encounter will be a simple pull of all the rows 
    //attatched to the encounter card

    /**rollInitiative: kinda the focal point of this class. It'll get passed the encounter ID and an
     * array of IEIDs paired either with an absolute turn order placement or initiative modifier.
     * (eventually it'll get the dex score for breaking ties)
     * The function will roll for the entities w/o manual overrides, pull the hp maxes from the
     * IE table (if the starter info doesn't have it), add the results to the initiative db table, 
     * and return the completed initiative table
     * list.
    */

    /**insertEntity: accepts a single row and adds it to a rolled initiative table identically
     * to the rolledInitiative method. Returns updated table.
     */

    /**damage:  takes an encounterID and an IEID and deals damage to that row of the initiative 
     * table. Throws an error if the target is invalid. Marks the creature as dead if it drops below 1hp
     */

    /**exitCombat: clears all initiative rows associated with encounter card Simply returns success message */
}


module.exports = Initiative;