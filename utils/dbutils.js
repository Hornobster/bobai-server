/**
 * Created by carlovespa on 06/02/15.
 */
var pg = require('pg');

var dbutils = {
    saveToken: function(token, userid) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('INSERT INTO tokens (userid, token) VALUES ($1, $2) ON CONFLICT DO UPDATE SET token = excluded.token', [userid, token], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                }
            });
        });
    },

    destroyToken: function(token) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('DELETE FROM tokens WHERE token = $1', [token], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                }
            });
        });
    },

    isTokenValid: function(token, userid, callback) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT * FROM tokens WHERE token = $1 AND userid = $2', [token, userid], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                } else {
                    if (result.rows.length > 0) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            });
        });
    }
};

module.exports = dbutils;
