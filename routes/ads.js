/**
 * Created by carlovespa on 08/02/15.
 */

var pg = require('pg');
var config = require('../config.js');
var utils = require('../utils/genericutils.js');

var ads = {
    getByUserId: function (req, res) {
        var query = 'SELECT * FROM ads WHERE userid = $1';
        var queryParams = [req.params.userid];

        if (req.query.category) {
            query += ' AND category = $2';
            queryParams.push(req.query.category);
        }

        query += ' ORDER BY date_expires';

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
                    res.json(result.rows);
                }
            });
        });
    },

    getById: function (req, res) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT * FROM ads WHERE id = $1', [req.params.id], function (err, result) {
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
                    res.json(result.rows[0]);
                }
            });
        });
    },

    getNearby: function (req, res) {
        var lat = parseFloat(req.params.lat) || '';
        var lon = parseFloat(req.params.lon) || '';
        var limit = parseInt(req.params.limit) || '';

        if (lat === '' || lon === '' || limit === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        lat *= config.geo.lonLatDBScale;
        lon *= config.geo.lonLatDBScale;

        var query = 'SELECT * FROM (SELECT *, GCDist($1, $2, lat, lon) AS dist FROM ads' +
            ' ORDER BY date_created DESC LIMIT $3) t WHERE dist < radius';
        var queryParams = [lat, lon, limit];

        if (req.query.category) {
            query = 'SELECT * FROM (SELECT *, GCDist($1, $2, lat, lon) AS dist FROM ads WHERE category = $3' +
                ' ORDER BY date_created DESC LIMIT $4) t WHERE dist < radius';
            queryParams = [lat, lon, req.query.category, limit];
        }

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
                    res.json(result.rows);
                }
            });
        });
    },

    postAd: function (req, res) {
        var title = req.body.title || '';
        var description = req.body.description || '';
        var category = req.body.category || '';
        var radius = req.body.radius || '';
        var lat = req.body.lat || '';
        var lon = req.body.lon || '';
        var duration = req.body.duration || '';
        var homeDelivery = req.body.homeDelivery || 0;

        if (title === '' || description === '' || category === '' || radius === '' || lat === '' || lon === '' || duration === '' || homeDelivery === '' ||
            title.length > config.adsInfo.titleMaxLength || description.length > config.adsInfo.descriptionMaxLength || duration > config.adsInfo.maxDuration) {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        var date_expires = new Date();
        date_expires.setTime(date_expires.getTime() + (duration * 60 * 60 * 1000));

        var ad = {
            userid: req.loggedUserId,
            title: title,
            description: description,
            category: category,
            radius: radius,
            lat: Math.floor(lat * config.geo.lonLatDBScale),
            lon: Math.floor(lon * config.geo.lonLatDBScale),
            date_expires: date_expires,
            homeDelivery: homeDelivery
        };

        var queryParams = [];
        var query = utils.genInsertIntoQuery('ads', ad, queryParams);

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
                        message: config.statusMessages.adPostSuccess,
                        adId: result.rows[0].id
                    });
                }
            });
        });
    }
};

module.exports = ads;
