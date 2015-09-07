/**
 * Created by carlovespa on 02/09/15.
 */
var pg = require('pg');
var config = require('../config.js');
var utils = require('../utils/genericutils.js');

var info = {
    getUsername: function(req, res) {
        var userid = parseInt(req.params.userid) || '';

        if (userid === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT username FROM users WHERE id = $1', [userid], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.json({
                        status: 500,
                        message: config.statusMessages.internalError,
                        error: err
                    });
                } else {
                    res.status(200);
                    res.json(result.rows[0] || {username: 'Unknown'});
                }
            });
        });
    },
    getPropOwnerUsername: function(req, res) {
        var propid = parseInt(req.params.propid) || '';

        if (propid === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT users.id, users.username FROM users, proposals WHERE proposals.id = $1 AND users.id = proposals.userid', [propid], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.json({
                        status: 500,
                        message: config.statusMessages.internalError,
                        error: err
                    });
                } else {
                    res.status(200);
                    res.json(result.rows[0] || {username: 'Unknown'});
                }
            });
        });
    },
    getAdOwnerUsername: function(req, res) {
        var adid = parseInt(req.params.adid) || '';

        if (adid === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT users.id, users.username FROM users, ads WHERE ads.id = $1 AND users.id = ads.userid', [adid], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                    res.status(500);
                    res.json({
                        status: 500,
                        message: config.statusMessages.internalError,
                        error: err
                    });
                } else {
                    res.status(200);
                    res.json(result.rows[0] || {username: 'Unknown'});
                }
            });
        });
    }
};

module.exports = info;
