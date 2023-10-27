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

INSERT INTO initiative_entities (name, description,type, owner_username, created_by, png, player_name, ac, passive_wis, hp_max)
    VALUES  ('testNPC', 'exampe NPC inserted at DB creation', 'NPC', 'testuser', 'testuser',NULL, NULL,NULL,NULL, 10),
            ('testPC', 'exampe PC inserted at DB creation', 'PC', 'testuser', 'testuser',NULL,'Jimmy John', 15, 8, NULL),
            ('testMonster', 'exampe Monster inserted at DB creation', 'Monster', 'testadmin', 'testuser', 'placeholderPNGURL', NULL,NULL,NULL, 50);

INSERT INTO encounters (description, owner_username, created_by, stat_block_id, dice_count, dice_size)
VALUES  ('Example encounter', 'testuser', 'testuser', 3, 1,4),
        ('Second example encounter', 'testuser', 'testuser', 1, 1,12);


INSERT INTO random_encounter_tables (description, owner_username, created_by, dice_count, dice_size, trigger)
VALUES ('Example table', 'testuser', 'testuser', 2,6, 18);

INSERT INTO initiative (encounter_id, entity_id, current_hp, turn_order)
VALUES  (1,1,10,5),
        (1,2,NULL,17),
        (2,3,30,23),
        (2,2,NULL,9);

INSERT INTO table_encounters (table_id, encounter_id, range_start, range_end)
VALUES (1,1,5,10);

INSERT INTO initiative_rows (table_id, entity_id, count, initiative)
VALUES (1,1,1,14),(1,2,2,17), (1,3,3,20);
