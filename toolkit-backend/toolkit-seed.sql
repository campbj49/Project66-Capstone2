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

INSERT INTO initiative_entities (name, description,type, owner_username, created_by, png, player_name, ac, passive_wis)
    VALUES  ('testNPC', 'exampe NPC inserted at DB creation', 'NPC', 'testuser', 'testuser',NULL, NULL,NULL,NULL),
            ('testPC', 'exampe PC inserted at DB creation', 'PC', 'testuser', 'testuser',NULL,'Jimmy John', 15, 8),
            ('testMonster', 'exampe Monster inserted at DB creation', 'Monster', 'testadmin', 'testuser', 'placeholderPNGURL', NULL,NULL,NULL);

INSERT INTO encounters (descr, stat_block_id, dice)
VALUES ('Example encounter', 3, '1d4');


INSERT INTO random_encounter_tables (descr, dice, trigger, owner_username)
VALUES ('Example table', '1d8+1d12', 18, 'testuser');

INSERT INTO table_encounters (table_id, encounter_id, range_start, range_end)
VALUES (1,1,5,10);

INSERT INTO initiative_rows (table_id, entity_id, count, initiative)
VALUES (1,1,1,14),(1,2,2,17), (1,3,3,20);
