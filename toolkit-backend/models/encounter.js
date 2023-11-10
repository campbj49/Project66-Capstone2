const { user } = require("pg/lib/defaults");
const db = require("../db");
const { sqlForPartialUpdate, sqlResToJs, sqlArrToJs } = require("../helpers/sql");
const { BadRequestError } = require("../expressError");


/** Collection of related methods for player characters */

class Encounter {
    /**
     * Adds a player character to the database
     * throws an error if any of the information is missing
     * 
     * on a success returns {name, description, owner_username, player_name, ac, passive_wis}
     */

    static async create(data, ownerUsername){
        //convert the data into its SQL readable format
        const {values, createdVals} = sqlForPartialUpdate({...data, ownerUsername:ownerUsername});

        //start by creating the base encounter record
        const entityResult = await db.query(
              `INSERT INTO encounters(${createdVals.cols})
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
            `SELECT * FROM encounters 
            WHERE owner_username = $1`,
            [
                username,
            ],
        );
        
        return sqlArrToJs(pcListResults.rows);
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
            `SELECT * FROM encounters
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
    static async update(id,data, ownerUsername){
        //proces the data into usable form
        const {setCols, values} = sqlForPartialUpdate(data);
        let idIndex = values.length + 1;
        let usernameIndex = idIndex + 1;

        //start by creating the base encounter record
        const entityResult = await db.query(
              `UPDATE encounters
               SET ${setCols}
                WHERE id = $${idIndex} AND owner_username = $${usernameIndex}
                RETURNING *`,
            [...values, id, ownerUsername],
        );
        if(!entityResult.rows[0]) throw new BadRequestError("Invalid user/encounter id combo")

        return sqlResToJs(entityResult.rows[0]);
    }

    static async remove(id, username){
        const deleteResult = await db.query(
            `DELETE FROM encounters WHERE id = $1 AND owner_username = $2`,
            [id, username]
        );
    }
}

module.exports = Encounter;