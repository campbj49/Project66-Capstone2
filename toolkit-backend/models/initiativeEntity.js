const { user } = require("pg/lib/defaults");
const db = require("../db");
const { sqlForPartialUpdate, sqlResToJs } = require("../helpers/sql");


/** Collection of related methods for player characters */

class InitiativeEntity {
    /**
     * Adds a player character to the database
     * throws an error if any of the information is missing
     * 
     * on a success returns {name, description, owner_username, player_name, ac, passive_wis}
     */

    static async create(data, ownerUsername){
        //convert the data into its SQL readable format
        const {values, createdVals} = sqlForPartialUpdate({...data, ownerUsername:ownerUsername});

        //start by creating the base initiative entity record
        const entityResult = await db.query(
              `INSERT INTO initiative_entities(${createdVals.cols})
               VALUES (${createdVals.idx})
               RETURNING *`,
            values,
        );
        
        return sqlResToJs(entityResult.rows[0]);
    }

    /**
     * 
     * @param {string} username 
     * @returns {Object} {{id, desc,...},{id, desc,...},...}
     */

    static async findAll(username){
        //get all the IEs associated with a particular user
        const pcListResults = await db.query(
            `SELECT * FROM initiative_entities 
            WHERE owner_username = $1`,
            [
                username,
            ],
        );
        return pcListResults.rows;
    }

    /**
     * 
     * @param {Int} id Database ID of IE being pulled
     * @param {String} username 
     * @returns {Object} {id, ownerUsername, ...}
     */

    static async findOne(id, username){
        //get all the IEs associated with a particular user
        const pcResults = await db.query(
            `SELECT * FROM initiative_entities
            WHERE owner_username = $1 AND id = $2`,
            [
                username,
                id,
            ],
        );
        //catch when the user doesn't own the id
        if(!pcResults.rows[0]) return {};
        return pcResults.rows[0];
    }

    /**
     * 
     * @param {Int} id IE being updated
     * @param {Object} data Fields being updated
     * @param {*} username 
     * 
     * @returns {Object} {updatedCharacter:{id, desc,...}}
     */
    static async update(
        id,{name, description, playerName, ac, passiveWis}, ownerUsername
    ){
        //start by creating the base initiative entity record
        const entityResult = await db.query(
              `UPDATE initiative_entities
               SET
                    name = $1,
                    description = $2,
                    owner_username = $3,
                    player_name = $4,
                    ac=$5,
                    passive_wis = $6
                WHERE id = $7
                RETURNING 
                    id, 
                    name, 
                    description, 
                    owner_username AS "ownerUsername",
                    player_name AS "playerName",
                    ac,
                    passive_wis AS "passiveWis"`,
            [
              name,
              description,
              ownerUsername,
              playerName,
              ac,
              passiveWis,
              id
            ],
        );

        return entityResult.rows[0];
    }

    static async remove(id, username){
        const deleteResult = await db.query(
            `DELETE FROM initiative_entities WHERE id = $1 AND owner_username = $2`,
            [id, username]
        );
    }
}

module.exports = InitiativeEntity;