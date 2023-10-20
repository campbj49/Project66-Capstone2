const { user } = require("pg/lib/defaults");
const db = require("../db");
const { sqlForPartialUpdate, sqlResToJs } = require("../helpers/sql");


/** Collection of related methods for player characters */

class RandomEncounterTable {
    /**
     * Adds a player character to the database
     * throws an error if any of the information is missing
     * 
     * on a success returns {name, description, owner_username, player_name, ac, passive_wis}
     */

    static async create(data, ownerUsername){
        //Split the encounters off of the given data
        let encounters = data.encounters;
        delete data.encounters;
        //convert the data into its SQL readable format
        const {values, createdVals} = sqlForPartialUpdate({...data, ownerUsername:ownerUsername});
        //start by creating the base random encounter table record
        const tableResult = await db.query(
              `INSERT INTO random_encounter_tables(${createdVals.cols})
               VALUES (${createdVals.idx})
               RETURNING *`,
            values,
        );
        let tableHeader = sqlResToJs(tableResult.rows[0])

        //do the same process for each of the encounters rows
        let encounterCols;
        let encounterVals = [];
        let idxCount = 1;
        let encounterIdx = "";
        //load values into variables
        for(let encounter of encounters){
            const {values, createdVals} = sqlForPartialUpdate({tableId:tableHeader.id,...encounter});
            encounterCols = createdVals.cols;
            encounterVals = encounterVals.concat(values);
            encounterIdx +="(";
            for(let i = 0; i<values.length;i++){
                encounterIdx += '$'+ idxCount;
                idxCount++;
                if(i!=values.length-1) encounterIdx +=","
            }
            encounterIdx +="),";
        }
        //cut off the last comma
        encounterIdx = encounterIdx.slice(0,-1);
        console.log(encounterIdx);
        const encounterResult = await db.query(
              `INSERT INTO table_encounters(${encounterCols})
               VALUES ${encounterIdx}
               RETURNING *`,
            encounterVals,
        );
        
        tableHeader.encounters = sqlResToJs(encounterResult.rows)
        return tableHeader;
    }

    /**
     * 
     * @param {string} username 
     * @returns {Object} {{id, desc,...},{id, desc,...},...}
     */

    static async findAll(username){
        //get all the IEs associated with a particular user
        const pcListResults = await db.query(
            `SELECT * FROM random_encounter_tables 
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
            `SELECT * FROM random_encounter_tables
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

        console.log(values);
        //start by creating the base random encounter table record
        const tableResult = await db.query(
              `UPDATE random_encounter_tables
               SET ${setCols}
                WHERE id = $${idIndex} AND owner_username = $${usernameIndex}
                RETURNING *`,
            [...values, id, ownerUsername],
        );

        return sqlResToJs(tableResult.rows[0]);
    }

    static async remove(id, username){
        const deleteResult = await db.query(
            `DELETE FROM random_encounter_tables WHERE id = $1 AND owner_username = $2`,
            [id, username]
        );
    }
}

module.exports = RandomEncounterTable;