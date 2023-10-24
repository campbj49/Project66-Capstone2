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

    static async create(data, encounters, ownerUsername){
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
        tableHeader.encounters = await processEncounters(tableHeader.id, encounters);
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
    static async update(id, data, encounters, ownerUsername){
        let finalResult = {};
        //proces the data into usable form if the header exists
        if(data){
            const {setCols, values} = sqlForPartialUpdate(data);
            let idIndex = values.length + 1;
            let usernameIndex = idIndex + 1;

            //start by creating the base random encounter table record
            const tableResult = await db.query(
                `UPDATE random_encounter_tables
                SET ${setCols}
                    WHERE id = $${idIndex} AND owner_username = $${usernameIndex}
                    RETURNING *`,
                [...values, id, ownerUsername],
            );
            finalResult = sqlResToJs(tableResult.rows[0]);
        }
        //check to make sure the user/id combo actually exists and fill out results if they do
        else{
            const tableResult = await db.query(
                `SELECT * FROM random_encounter_tables
                WHERE id = $${idIndex} AND owner_username = $${usernameIndex}`
            );
            if(!tableResult.rows[0]) return {};
            finalResult = sqlResToJs(tableResult.rows[0]);
        }

        if(encounters){
            //construct the chain of update requests to be sent to the database
            let encountersUpdate = "";
            for(let encounter of encounters){
                const {setCols, values} = sqlForPartialUpdate(encounter);
                let encounterIndex = values.length + 1;
                let tableIndex = encounterIndex + 1;
    
                //start by creating the base random encounter table record
                const encounterResult = await db.query(
                    `UPDATE table_encounters
                    SET ${setCols}
                        WHERE table_id = $${tableIndex} AND encounter_id = $${tableIndex}
                        RETURNING *`,
                    [
                        ...values, 
                        encounter.tableId, 
                        encounter.encounterId
                    ],
                );
                finalResult.encounters.push(sqlResToJs(encounterResult.rows[0]));
            }
        }

        //collect and process the encounter rows associated with the table, now updated
        const tableEncounterRes = await db.query(
            `SELECT * FROM table_encounters
            WHERE table_id = $1`,
            [id]
        );
        finalResult.encounters = [];
        for(let row of tableEncounterRes.rows){
            finalResult.encounters.push(sqlResToJs(row));
        }

        return finalResult;
    }

    static async remove(id, username){
        const deleteResult = await db.query(
            `DELETE FROM random_encounter_tables WHERE id = $1 AND owner_username = $2`,
            [id, username]
        );
    }
}


/**
 * Helper function to handle encounter rows in table creation and updating
 * @param {*} tableId Id of the table the prosceced encounters will be attatched to
 * @param {*} encounters Array of the rows to be attatched to the table in raw SQL form
 * 
 * @returns array of JS objects of the rows of the table
 */
async function processEncounters(tableId, encounters){
    let encounterCols;
    let encounterVals = [];
    let idxCount = 1;
    let encounterIdx = "";
    //load values into variables
    for(let encounter of encounters){
        const {values, createdVals} = sqlForPartialUpdate({tableId:tableId,...encounter});
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
    const encounterResult = await db.query(
          `INSERT INTO table_encounters(${encounterCols})
           VALUES ${encounterIdx}
           RETURNING *`,
        encounterVals,
    );

    //convert each retreived row into 
    let finalEncounters = []
    for(let row of encounterResult.rows){
        finalEncounters.push(sqlResToJs(row));
    }
    return finalEncounters;
}

module.exports = RandomEncounterTable;