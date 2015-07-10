/**
 * Created by carlovespa on 06/02/15.
 */
var bcrypt = require('bcrypt');
var pg = require('pg');
var config = require('../config.js');
var utils = require('../utils/genericutils.js');

var registration = {
    signup: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';
        var email = req.body.email || '';
        var phone = req.body.phone || '';

        // check if we actually received the data
        if (username === '' || password === '' || email === '' || phone === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        // validation patterns
        var emailPat = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        var usernamePat = /^[A-Za-z0-9 _]{1,30}$/; // alphanumeric with space and underscore, max 30 chars
        var passwordPat = /^[A-Za-z0-9!@#$&*]{8,}$/; // alphanumeric with specials (!@#$&*), min 8

        if (emailPat.test(email) && usernamePat.test(username) && passwordPat.test(password)) { // email, username and password are valid
            var hash = bcrypt.hashSync(password, 8);

            var user = {
                username: username,
                email: email,
                password: hash,
                phone: phone.replace(/\s+/g, '') // remove whitespaces
            };

            var queryParams = [];
            var query = utils.genInsertIntoQuery('users', user, queryParams);

            // add user data to DB
            pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                client.query(query, queryParams, function (err, result) {
                    done();
                    if (err) {
                        if (err.code === '23505') { // username, email or phone number not available
                            // investigate
                            pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                                client.query('SELECT SUM(CASE WHEN username = $1 THEN 1 ELSE 0 END) AS u, SUM(CASE WHEN email = $2 THEN 1 ELSE 0 END) AS e, SUM(CASE WHEN phone = $3 THEN 1 ELSE 0 END) AS p FROM users', [user.username, user.email, user.phone], function (err, result) {
                                    done();
                                    if (err) {
                                        console.error(err);
                                        res.status(500);
                                        res.json({
                                            status: 500,
                                            message: config.statusMessages.internalError,
                                            error: err
                                        });
                                    }
                                    else {
                                        var duplicates = {
                                            username: result.rows[0].u > 0,
                                            email: result.rows[0].e > 0,
                                            phone: result.rows[0].p > 0
                                        };

                                        res.status(400);
                                        res.json({
                                            status: 400,
                                            message: config.statusMessages.alreadyInUse,
                                            duplicates: duplicates
                                        });
                                    }
                                });
                            });
                        } else { // other error
                            res.status(500);
                            res.json({
                                status: 500,
                                message: config.statusMessages.internalError,
                                error: err
                            });
                        }
                    }
                    else {
                        res.status(200);
                        res.json({
                            status: 200,
                            message: config.statusMessages.userSignupSuccess
                        });
                    }
                });
            });
        } else { // email, username and password are invalid
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
        }
    }
};

module.exports = registration;
