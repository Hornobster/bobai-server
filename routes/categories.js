/**
 * Created by carlovespa on 19/04/15.
 */
var pg = require('pg');
var config = require('../config.js');

var categories = {
    getCategories: function (req, res) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT * FROM categories', function (err, result) {
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
                    res.status(200);
                    res.json(result.rows);
                }
            });
        });
    }
};

module.exports = categories;