# Overview
The API I will be using in this project is http://www.dnd5eapi.co/. It has all of the default stat blocks I need plus some other material from the rule books that I may use if I continue to expand the features of the project. A custom API will grant the frontend access to both the database and the main API. 
## Database Schema
- User
    - username: primary key used for user identification
    - first_name
    - last_name
    - email
    - password: encrypted and seeded using some 3rd party extension
- PC: Player characters
    - id
    - name
    - player_name
    - AC
    - passive wis
- NPC: Non-player character
    - id: automaticaly generated integer primary key
    - name
    - description
    - stat_block_id: foreign key to the Stat Block table
    - creator: username of the user that created this particular NPC
    - is_public: boolean that allows other users to add the NPC to their own list of characters
- Stat Block
    - id: automaticaly generated integer primary key
    - name
    - PNG: link or upload of a PNG for the creature described in the stat block
    - JPG: link or upload to the JPG of the stat block itself. To get the CR calculator fully functional each stat will need its own column, but to start I'll leave it as just a JPG.
- Encounter
    - id: automaticaly generated integer primary key
    - description: text for suggested flavor and/or other non-stat block mechanical details
    - stat_block_id: foreign key to stat block table 
    - dice: number and size of dice used for generating the number of creatures in the encounter
- Random Encounter Table
    - id: automaticaly generated integer primary key
    - decription: biome/weather/territory it would be appropriate to use the table in
    - dice: number and size of the dice being used to generate the table
    - trigger: d20 roll that causes an encounter to occur.
- Table Encounters:
    - table_id: half the primary key and foreign key for the RET the encounter is attatched to
     - encounter_id: half the primary key and foregin key to the encounter detail table
     - range: numbers that have to be rolled on the parent table for this encounter to occur
- Initiative: rows of initiative table
    - id
    - table_id
    - character_id: PC, NPC, or monster ID
    - count: number of specified stat block
    - initiative: value 
- Weather
    - id
    - description: specify territpry and time of year this table is for
    - dice count and size for the table