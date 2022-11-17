DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_matches;
DROP TABLE IF EXISTS user_to_messages;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS dorms;

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY NOT NULL,
    is_admin boolean NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    housing_id integer,
    graduation_year integer,
    graduation_season_id integer,
    min_rent integer,
    max_rent integer,
    about_me VARCHAR(500)
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
    message_id SERIAL PRIMARY KEY NOT NULL,
    sender_id integer,
    message VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS dorms (
    dorm_id SERIAL PRIMARY KEY,
    dorm_name VARCHAR(100) NOT NULL,
    description VARCHAR(500)
);