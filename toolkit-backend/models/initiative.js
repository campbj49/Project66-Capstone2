
const db = require("../db");
const { sqlForPartialUpdate, sqlResToJs, sqlArrToJs } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { rollDice } = require("../helpers/dice");


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
    static async findOne(username, id){
        const initiativesList = await db.query(
            `SELECT i.* FROM initiative AS i
            INNER JOIN encounters AS e ON i.encounter_id = e.id
            WHERE e.owner_username = $1 AND e.id = $2`,
            [
                username,
                id
            ]
        );
        if(!initiativesList.rows[0]) 
            throw new BadRequestError("No initiative ID associated with that username.");
        return sqlArrToJs(initiativesList.rows);
    }

    /**rollInitiative: kinda the focal point of this class. It'll get passed the encounter ID and an
     * array of IEIDs paired either with an absolute turn order placement or initiative modifier.
     * (eventually it'll get the dex score for breaking ties)
     * The function will roll for the entities w/o manual overrides, pull the hp maxes from the
     * IE table (if the starter info doesn't have it), add the results to the initiative db table, 
     * and return the completed initiative table
     * list.
    */
    static async rollInitiative(username, id, rows){
        //verify the username has editing access to the encounter
        const editVerify = await db.query(
            `SELECT owner_username AS ownerUsername FROM encounters 
            WHERE id = $1 AND owner_username = $2`,
            [
                id,
                username
            ]
        );
        if(!editVerify.rows[0]) throw new BadRequestError("Invalid user/encounter id combination")

        //clear the initiative table of any rows attatched to the encounter
        await db.query(`DELETE FROM initiative WHERE encounter_id = $1`, [id]);

        //fill out turn order values
        for(let row of rows)
            if(!row.turnOrder) row.turnOrder = rollDice(20) + row.initMod || 0;
        //sort by turn order and mark the first as active
        rows.sort((firstE, secondE) =>{
            if(firstE.turnOrder <= secondE.turnOrder)
                return 1;
            else if(firstE.turnOrder > secondE.turnOrder)
                return -1;
        });
        rows[0].isActive = true;

        //process the rows into usable initiative records
        let processedRow = [];
        for(let [index, row] of rows.entries()){
            //eventually will be able to pull the initMod directly from the card
            let entityCard = await db.query(
                `SELECT * FROM initiative_entities WHERE id = $1`,
                [row.entityId]
            );
            entityCard = sqlResToJs(entityCard.rows[0]);

            const result = await db.query(
                `INSERT INTO initiative (
                    encounter_id, 
                    entity_id, 
                    current_hp, 
                    turn_order,
                    is_active,
                    next_entity
                )
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    id,
                    row.entityId,
                    entityCard.hpMax,
                    row.turnOrder,
                    row.isActive || false,
                    rows[(index+1)%rows.length].entityId
                ]
            );
            processedRow.push(sqlResToJs(result.rows[0]));
        }

        return processedRow;
   }

    /**kill: remove row from initiative. Returns updated initiative */
    static async kill(username, id, entityIds){
        //verify the username has editing access to the encounter
        const editVerify = await db.query(
            `SELECT owner_username AS ownerUsername FROM encounters 
            WHERE id = $1 AND owner_username = $2`,
            [
                id,
                username
            ]
        );
        if(!editVerify.rows[0]) throw new BadRequestError("Invalid user/encounter id combination")
        for(let entityId of entityIds){
            await db.query(
                `DELETE FROM initiative 
                WHERE entity_id = $1 AND encounter_id = $2`,
                [
                    entityId,
                    id
                ]
            )
        }

        const updatedInitiative = await db.query(
            `SELECT * FROM initiative WHERE encounter_id = $1`,
            [id]
        )

        return this.rollInitiative(username, id, sqlArrToJs(updatedInitiative.rows));
    }

    /**damage:  takes an encounterID and an IEID and deals damage to that row of the initiative 
     * table. Throws an error if the target is invalid. Marks the creature as dead if it drops below 1hp
     */
    static async damage(username, id, data){
        //verify the username has editing access to the encounter
        const editVerify = await db.query(
            `SELECT owner_username AS ownerUsername FROM encounters 
            WHERE id = $1 AND owner_username = $2`,
            [
                id,
                username
            ]
        );
        if(!editVerify.rows[0]) throw new BadRequestError("Invalid user/encounter id combination")
        
        await db.query(
            `UPDATE initiative
            SET current_hp = current_hp - $1
            WHERE entity_id = $2 AND encounter_id = $3`,
            [
                data.damage,
                data.entityId,
                id
            ]
        )
        

        const updatedInitiative = await db.query(
            `SELECT * FROM initiative 
            WHERE encounter_id = $1
            ORDER BY turn_order DESC`,
            [id]
        )

        return sqlArrToJs(updatedInitiative.rows);
    }

    /**exitCombat: clears all initiative rows associated with encounter card Simply returns success message */
    static async exitCombat(username, id){
        //verify the username has editing access to the encounter
        const editVerify = await db.query(
            `SELECT owner_username AS ownerUsername FROM encounters 
            WHERE id = $1 AND owner_username = $2`,
            [
                id,
                username
            ]
        );
        if(!editVerify.rows[0]) throw new BadRequestError("Invalid user/encounter id combination");

        //clear the initiative table of any rows attatched to the encounter
        await db.query(`DELETE FROM initiative WHERE encounter_id = $1`, [id]);
    }

    /**nextEntity: increments the given encounter's initiative count and returns the creature
     * card of the active inititive_entity
     */
    static async nextEntity(username, id){
        //verify the username has editing access to the encounter
        const editVerify = await db.query(
            `SELECT owner_username AS ownerUsername FROM encounters 
            WHERE id = $1 AND owner_username = $2`,
            [
                id,
                username
            ]
        );
        if(!editVerify.rows[0]) throw new BadRequestError("Invalid user/encounter id combination");

        //pull the active row from initiative
        const activeCreature = await db.query(
            `SELECT entity_id AS entityId, next_entity AS nextEntity
            FROM initiative
            WHERE encounter_id = $1 AND is_active ='TRUE'`,
            [
                id
            ]
        );
        if(!activeCreature.rows[0]) throw new BadRequestError("No active creature");
        let [oldId, newId] = [activeCreature.rows[0].entityid, activeCreature.rows[0].nextentity]

        //update the active values in the rows
        await db.query(
            `UPDATE initiative SET is_active = NOT is_active
            WHERE (entity_id = $1 OR entity_id = $2) AND (encounter_id = $3)`,
            [
                oldId,
                newId,
                id
            ]
        )

        //pull the creature card data
        const creatureCard = await db.query(
            `SELECT * FROM initiative_entities WHERE id = $1`,
            [
                newId
            ]
        )
        return sqlResToJs(creatureCard.rows[0]);
    }

    /**insertEntity: accepts a single row and adds it to a rolled initiative table identically
     * to the rolledInitiative method. Returns updated table. Will probably just stick with 
     * re-running rollInitiative
     */
}

module.exports = Initiative;