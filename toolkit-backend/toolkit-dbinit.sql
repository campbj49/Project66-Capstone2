DROP DATABASE toolkit;
CREATE DATABASE toolkit;

DROP DATABASE toolkit_test;
CREATE DATABASE toolkit_test;

\c toolkit
\i toolkit-schema.sql
\i toolkit-seed.sql

\c toolkit_test
\i toolkit-schema.sql
\i toolkit-seed.sql