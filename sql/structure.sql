drop table if exists users cascade;
drop table if exists ads cascade;
drop table if exists proposals cascade;
drop table if exists categories cascade;
drop table if exists tokens cascade;

CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(30) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password CHAR(60) NOT NULL, phone VARCHAR(20) UNIQUE NOT NULL, date_registered TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE ads (id SERIAL PRIMARY KEY, userid INTEGER REFERENCES users (id) NOT NULL, title VARCHAR(100) NOT NULL, description VARCHAR(250) NOT NULL, category INTEGER NOT NULL, radius REAL NOT NULL, homeDelivery INTEGER NOT NULL DEFAULT 0, lat INTEGER NOT NULL, lon INTEGER NOT NULL, date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, date_expires TIMESTAMP NOT NULL);

CREATE TABLE proposals (id SERIAL PRIMARY KEY, userid INTEGER REFERENCES users (id) NOT NULL, adid INTEGER REFERENCES ads (id) NOT NULL, price INTEGER CHECK (price > 0) NOT NULL, notes VARCHAR(250) NOT NULL, photo VARCHAR(200), lat INTEGER NOT NULL, lon INTEGER NOT NULL, date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(30) NOT NULL);

CREATE TABLE tokens (userid INTEGER REFERENCES users (id) PRIMARY KEY NOT NULL, token VARCHAR(60) NOT NULL)
