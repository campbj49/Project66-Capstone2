/*die size list:
  CHECK (<collumn> IN (1,2,6,8,10,12,20,100)),
 */

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN
);

--splitting the different initiative entities into different tables overcomplicates the schema
--far easier to just have the different forms only have the relavent fields visible
CREATE TABLE initiative_entities(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT DEFAULT 'Monster',
  CHECK (type in ('Monster', 'NPC', 'PC')),
  owner_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT 'FALSE',
  player_name TEXT,
  ac INT,
  passive_wis INT,
  png TEXT,
  hp_max INT
  --fill out the stat once I have a proper connection to the DnD API
  --will probably need to make actions, attributes, and special abilities all separate mini tables
);
CREATE TABLE encounters(
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  owner_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT 'FALSE',
  stat_block_id INT REFERENCES initiative_entities(id) ON DELETE CASCADE,
  dice_size INT NOT NULL,
  CHECK (dice_size IN (1,2,4,6,8,10,12,20,100)),
  dice_count INT NOT NULL,
  dice_modifier INT DEFAULT 0
);

CREATE TABLE initiative(
  entity_id INT REFERENCES initiative_entities(id) ON DELETE CASCADE,
  encounter_id INT REFERENCES encounters(id) ON DELETE CASCADE,
  PRIMARY KEY (entity_id, encounter_id),
  current_hp INT,
  is_active BOOLEAN DEFAULT 'FALSE',
  turn_order INT NOT NULL,
  next_entity INT REFERENCES initiative_entities(id)
);

CREATE TABLE random_encounter_tables(
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  owner_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT 'FALSE',
  dice_size INT NOT NULL,
  CHECK (dice_size IN (1,2,4,6,8,10,12,20,100)),
  dice_count INT NOT NULL,
  range_max numeric GENERATED ALWAYS AS (dice_size*dice_count) STORED,
  trigger INT NOT NULL
);
--may eventually need add a helper table for multiple stat block types

CREATE TABLE table_encounters(
  table_id INT REFERENCES random_encounter_tables(id) ON DELETE CASCADE,
  encounter_id INT REFERENCES encounters(id) ON DELETE CASCADE,
  PRIMARY KEY (table_id, encounter_id),
  range_start INT NOT NULL,
  range_end INT NOT NULL CHECK (range_end>=range_start)
);

-- CREATE TABLE weather_tables(
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   desc TEXT NOT NULL,
--   dice TEXT NOT NULL
-- );
--weather table rows can wait
--really I can just coopt the RET database table & just not have a spot for stat blocks