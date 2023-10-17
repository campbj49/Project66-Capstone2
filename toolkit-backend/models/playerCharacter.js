const { user } = require("pg/lib/defaults");
const db = require("../db");


/** Collection of related methods for player characters */

class PlayerCharacter {
    /**
     * Adds a player character to the database
     * throws an error if any of the information is missing
     * 
     * on a success returns {name, description, owner_username, player_name, ac, passive_wis}
     */

    static async create(
        {name, description, playerName, ac, passiveWis}, ownerUsername
    ){
        //start by creating the base initiative entity record
        const entityResult = await db.query(
              `INSERT INTO initiative_entities
               (
                    name,
                    description,
                    owner_username
                )
               VALUES ($1, $2, $3)
               RETURNING id, name, description, owner_username AS "ownerUsername"`,
            [
              name,
              description,
              ownerUsername
            ],
        );
    
        let PC = entityResult.rows[0];

        const pcResult = await db.query(
            `INSERT INTO player_characters
            (
                id,
                player_name,
                ac,
                passive_wis
            )
            VALUES ($1, $2, $3, $4)
            RETURNING player_name AS "playerName", ac, passive_wis AS "passiveWis"`,
            [
                PC.id,
                playerName,
                ac,
                passiveWis
            ],
        );
        
        PC = {...PC, ... pcResult.rows[0]}

    
        return PC;
    }

    static async findAll(username){
        console.log(username);
        //get all the PCs associated with a particular user
        const pcListResults = await db.query(
            `SELECT * FROM initiative_entities AS ies
            INNER JOIN player_characters AS pcs ON ies.id = pcs.id
            WHERE ies.owner_username = $1`,
            [
                username,
            ],
        );
        return pcListResults.rows;
    }
}

module.exports = PlayerCharacter;