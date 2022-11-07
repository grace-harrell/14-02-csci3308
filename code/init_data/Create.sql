DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_matches;
DROP TABLE IF EXISTS users_to_messages;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS dorms;

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY NOT NULL,
    is_admin boolean NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    dorm_id integer,
    preferences integer ARRAY[5],
    about_me VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS user_matches (
    user_id integer,
    match_id integer
);

CREATE TABLE IF NOT EXISTS user_to_messages (
    recipient_id integer,
    message_id integer
);

CREATE TABLE IF NOT EXISTS messages (
    message_id integer,
    sender_id integer,
    message VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS dorms (
    dorm_id SERIAL PRIMARY KEY,
    dorm_name VARCHAR(100) NOT NULL,
    description VARCHAR(500)
);