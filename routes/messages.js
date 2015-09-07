/**
 * Created by carlovespa on 28/08/15.
 */
var pg = require('pg');
var config = require('../config.js');
var utils = require('../utils/genericutils.js');
var gcmutils = require('../utils/gcmutils.js');

var rollback = function(client, done) {
    client.query('ROLLBACK', function(err) {
        return done(err);
    });
    res.status(500);
    res.json({
        status: 500,
        message: config.statusMessages.internalError,
        error: err
    });
};

var messages = {
    getAllMessages: function (req, res) {
        // check that user has created the proposal or the ad
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT EXISTS (SELECT proposals.id, ads.id FROM proposals, ads WHERE (proposals.id=$1 AND proposals.userid=$2) OR (proposals.id=$1 AND ads.id=proposals.adid AND ads.userid=$2))::int', [req.params.propid, req.loggedUserId], function (err, result) {
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
                    if (result.rows[0].exists) { // valid userid/propid
                        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                            client.query('BEGIN', function (err) {
                                if (err) {
                                    console.error(err);
                                    return rollback(client, done);
                                }
                                else {
                                    process.nextTick(function() {
                                        client.query('UPDATE messages SET read=1 WHERE propid=$1 AND senderid!=$2 AND read=0', [req.params.propid, req.loggedUserId], function(err) {
                                            if(err) return rollback(client, done);
                                            client.query('SELECT * FROM messages WHERE propid=$1', [req.params.propid], function(err, result) {
                                                if(err) return rollback(client, done);
                                                client.query('COMMIT', done);

                                                res.status(200);
                                                res.json(result.rows);
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    } else {
                        console.error('Unauthorized get all messages. UserId:', req.loggedUserId, 'PropId:', req.params.propid);
                        res.status(403);
                        res.json({
                            status: 403,
                            message: config.statusMessages.unauthorized
                        });
                    }
                }
            });
        });
    },
    getUnreadMessages: function (req, res) {
        // check that user has created the proposal or the ad
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT EXISTS (SELECT proposals.id, ads.id FROM proposals, ads WHERE (proposals.id=$1 AND proposals.userid=$2) OR (proposals.id=$1 AND ads.id=proposals.adid AND ads.userid=$2))::int', [req.params.propid, req.loggedUserId], function (err, result) {
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
                    if (result.rows[0].exists) { // valid userid/propid
                        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                            client.query('UPDATE messages SET read=1 WHERE propid=$1 AND senderid!=$2 AND read=0 RETURNING *', [req.params.propid, req.loggedUserId], function (err, result) {
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
                    } else {
                        console.error('Unauthorized get unread messages. UserId:', req.loggedUserId, 'PropId:', req.params.propid);
                        res.status(403);
                        res.json({
                            status: 403,
                            message: config.statusMessages.unauthorized
                        });
                    }
                }
            });
        });
    },
    postMessage: function (req, res) {
        var propId = parseInt(req.params.propid) || '';
        var text = req.body.text.trim() || '';
        var adId = req.body.adId || '';
        var receiverId = req.body.receiverId || '';

        if (propId === '' || text === '' || text.length > 500 || adId === '' || receiverId === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        // check that user has created the proposal or the ad
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT EXISTS (SELECT proposals.id, ads.id FROM proposals, ads WHERE (proposals.id=$1 AND proposals.userid=$2) OR (proposals.id=$1 AND ads.id=proposals.adid AND ads.userid=$2))::int', [req.params.propid, req.loggedUserId], function (err, result) {
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
                    if (result.rows[0].exists) { // valid userid/propid
                        // save message to DB
                        var message = {
                            senderid: req.loggedUserId,
                            propid: propId,
                            text: text,
                            time_sent: (new Date())
                        };

                        var queryParams = [];
                        var query = utils.genInsertIntoQuery('messages', message, queryParams);
                        query = query.substring(0, query.length - 2);
                        query += '*';

                        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                            client.query(query, queryParams, function (err, result) {
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
                                    res.json({
                                        status: 200,
                                        message: result.rows[0]
                                    });

                                    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
                                        client.query('SELECT title FROM ads WHERE id=$1', [adId], function (err, result) {
                                            done();
                                            if (err) {
                                                console.error(err);
                                            } else {
                                                var title = result.rows[0].title;
                                                gcmutils.sendMessageNotificationToUserId(receiverId, title, text, propId);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    } else { // user/proposal not valid
                        console.error('Unauthorized message. UserId:', req.loggedUserId, 'PropId:', propId);
                        res.status(403);
                        res.json({
                            status: 403,
                            message: config.statusMessages.unauthorized
                        });
                    }
                }
            });
        });
    },
    registerGCMClient: function(req, res) {
        var registrationId = req.body.registrationId || '';

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT upsert_registrationid($1, $2)', [req.loggedUserId, registrationId], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                } else {
                    console.log('Registered GCM userid:', req.loggedUserId, registrationId);
                }
            });
        });
    }
};

module.exports = messages;
