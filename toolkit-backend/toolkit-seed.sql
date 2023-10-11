INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testuser',
        '$2b$12$k61qJFwDniCMCg4Sy4yb9OJl5QmKXqC2NHaIWHsL2DmMjO1QwhrU6',
        'Test',
        'User',
        'joel@joelburton.com',
        FALSE),
       ('testadmin',
        '$2b$12$k61qJFwDniCMCg4Sy4yb9OJl5QmKXqC2NHaIWHsL2DmMjO1QwhrU6',
        'Test',
        'Admin!',
        'joel@joelburton.com',
        TRUE);

INSERT INTO initiative_entities (name, description, owner_username)
    VALUES  ('testNPC', 'exampe NPC inserted at DB creation', 'testuser'),
            ('testPC', 'exampe PC inserted at DB creation', 'testuser'),
            ('testMonster', 'exampe Monster inserted at DB creation', 'testuser');

INSERT INTO stat_blocks (id, png)
    VALUES (3, 'placeholderPNGURL');

INSERT INTO non_player_characters(id, stat_block_id, created_by)
VALUES (1,3, 'testuser');

INSERT INTO player_characters(id, player_name, ac, passive_wis)
VALUES (2, 'Jimmy John', 15, 8);

INSERT INTO encounters (descr, stat_block_id, dice)
VALUES ('Example encounter', 3, '1d4');


INSERT INTO random_encounter_tables (descr, dice, trigger, owner_username)
VALUES ('Example table', '1d8+1d12', 18, 'testuser');

INSERT INTO table_encounters (table_id, encounter_id, range_start, range_end)
VALUES (1,1,5,10);

INSERT INTO initiative_rows (table_id, entity_id, count, initiative)
VALUES (1,1,1,14),(1,2,2,17), (1,3,3,20);
