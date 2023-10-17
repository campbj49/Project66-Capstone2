DROP DATABASE toolkit;
CREATE DATABASE toolkit;

\c toolkit

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
  owner_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE,
  created_by VARCHAR(25) REFERENCES users(username) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT 'FALSE',
  player_name TEXT,
  ac INT,
  passive_wis INT,
  png TEXT
  --fill out the stat once I have a proper connection to the DnD API
  --will probably need to make actions, attributes, and special abilities all separate mini tables
);
CREATE TABLE encounters(
  id SERIAL PRIMARY KEY,
  descr TEXT NOT NULL,
  stat_block_id INT REFERENCES initiative_entities(id) ON DELETE CASCADE,
  dice TEXT
);

CREATE TABLE random_encounter_tables(
  id SERIAL PRIMARY KEY,
  descr TEXT NOT NULL,
  dice TEXT NOT NULL,
  trigger INT NOT NULL,
  owner_username VARCHAR(25) REFERENCES users(username) ON DELETE CASCADE
);
--may eventually need add a helper table for multiple stat block types

CREATE TABLE table_encounters(
  table_id INT REFERENCES random_encounter_tables(id) ON DELETE CASCADE,
  encounter_id INT REFERENCES encounters(id) ON DELETE CASCADE,
  PRIMARY KEY (table_id, encounter_id),
  range_start INT NOT NULL,
  range_end INT NOT NULL CHECK (range_end>=range_start)
);

CREATE TABLE initiative_rows(
  table_id INT REFERENCES random_encounter_tables(id) ON DELETE CASCADE,
  entity_id INT REFERENCES initiative_entities(id) ON DELETE CASCADE,
  PRIMARY KEY (table_id, entity_id),
  count INT DEFAULT 1,
  initiative INT NOT NULL
);
\i toolkit-seed.sql

-- CREATE TABLE weather_tables(
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   desc TEXT NOT NULL,
--   dice TEXT NOT NULL
-- );
--weather table rows can wait
--really I can just coopt the RET database table & just not have a spot for stat blocks