/**
 * Created by carlovespa on 06/02/15.
 */

var jwt = require('jwt-simple');
var config = require('./../config.js');
var pg = require('pg');
var bcrypt = require('bcrypt');
var dbutils = require('../utils/dbutils.js');

var auth = {
    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username === '' || password === '') {
            res.status(403);
            res.json({
                status: 403,
                message: config.statusMessages.unauthorized
            });
            return;
        }

        // query DB and check credentials
        auth.validate(username, password, function(dbUser) {
            // if authentication failed, send 401
            if (!dbUser) {
                res.status(401);
                res.json({
                    status: 401,
                    message: config.statusMessages.credentialsInvalid
                });
            } else { // if successful, save token to DB and send it
                var token = genToken(dbUser);
                dbutils.saveToken(token.token, dbUser.id);

                res.json(token);
                console.log((new Date).toUTCString() + ' User ' + dbUser.username + ' just logged in.')
            }
        });
    },

    logout: function(req, res) {
        var key = (req.body && req.body.xKey) || req.headers['x-key'];
        var token = (req.body && req.body.xAccessToken) || req.headers['x-access-token'];

        if (token) {
            dbutils.destroyToken(token);

            res.status(200);
            res.json({
                status: 200,
                message: config.statusMessages.logoutSuccess
            });

            console.log((new Date).toUTCString() + ' User ' + key + ' just logged out.')
        } else {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.logoutFail
            });

            console.log((new Date).toUTCString() + ' User ' + key + ' logout failed.')
        }
    },

    validate: function(username, password, callback) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT * FROM users WHERE username = $1', [username], function (err, result) {
                done();
                if (err || result.rows.length === 0) { // DB error or non existing user
                    console.error(err);
                    callback(false);
                }
                else {
                    var hash = result.rows[0].password;
                    if (bcrypt.compareSync(password, hash)) { // passwords match
                        callback({
                            id: result.rows[0].id,
                            username: result.rows[0].username,
                            email: result.rows[0].email,
                            phone: result.rows[0].phone
                        });
                    } else { // passwords don't match
                        callback(false);
                    }
                }
            });
        });
    }
};

// private methods
function genToken(user) {
    var expires = expiresIn(config.tokenInfo.tokenDuration); // token duration
    var token = jwt.encode({exp: expires, userid: user.id}, config.tokenInfo.jwtSecret);

    return {
        status: 200,
        token: token,
        expires: expires,
        user: user
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;
