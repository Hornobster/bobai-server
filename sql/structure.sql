DELIMITER //

use lothar //

drop table if exists users //

CREATE TABLE users (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, username VARCHAR(30) UNIQUE NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password CHAR(60) NOT NULL, phone VARCHAR(20) UNIQUE NOT NULL, date_registered TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP); //

drop table if exists ads //

CREATE TABLE ads (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, userid INT UNSIGNED NOT NULL, title VARCHAR(100) NOT NULL, description VARCHAR(250) NOT NULL, category TINYINT UNSIGNED NOT NULL, radius FLOAT NOT NULL, homeDelivery TINYINT UNSIGNED NOT NULL DEFAULT 0, lat MEDIUMINT NOT NULL, lon MEDIUMINT NOT NULL, date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, date_expires TIMESTAMP NOT NULL); //

drop table if exists proposals //

CREATE TABLE proposals (id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT, userid INT UNSIGNED NOT NULL, adid INT UNSIGNED NOT NULL, price INT UNSIGNED NOT NULL, notes VARCHAR(250) NOT NULL, photo VARCHAR(200), lat MEDIUMINT NOT NULL, lon MEDIUMINT NOT NULL, date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP); //

drop table if exists categories //

CREATE TABLE categories (id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30) NOT NULL); //