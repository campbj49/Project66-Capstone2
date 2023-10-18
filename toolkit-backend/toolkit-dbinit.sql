DROP DATABASE toolkit;
CREATE DATABASE toolkit;

DROP DATABASE toolkit_test;
CREATE DATABASE toolkit_test;

\c toolkit
\i toolkit-schema.sql
\i toolkit-seed.sql

\c toolkit_test
\i toolkit-schema.sql
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