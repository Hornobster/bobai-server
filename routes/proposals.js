/**
 * Created by carlovespa on 09/02/15.
 */

var pg = require('pg');

var config = require('../config.js');
var utils = require('../utils/genericutils.js');

var proposals = {
    getByUserId: function (req, res) {
        var query = 'SELECT ads.title, proposals.* FROM ads, proposals WHERE proposals.userid = $1 AND ads.id = proposals.adid';
        var queryParams = [req.params.userid];

        if (req.query.category) {
            query = 'SELECT ads.title, proposals.* FROM ads, proposals WHERE proposals.userid = $1 AND ads.id = proposals.adid AND ads.category = $2';
            queryParams.push(req.query.category);
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

    getByAdId: function (req, res) {
        var lat = parseFloat(req.params.lat) || '';
        var lon = parseFloat(req.params.lon) || '';
        var adid = parseInt(req.params.adid) || '';

        if (lat === '' || lon === '' || adid === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        lat *= config.geo.lonLatDBScale;
        lon *= config.geo.lonLatDBScale;

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT *, GCDist($1, $2, lat, lon) AS dist FROM proposals WHERE adid = $3 ORDER BY dist', [lat, lon, adid], function (err, result) {
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

    postProposal: function (req, res) {
        var adId = req.body.adId || '';
        var price = req.body.price || '';
        var notes = req.body.notes || '';
        var lon = req.body.lon || '';
        var lat = req.body.lat || '';
        var photoURL = req.body.photoURL || '';

        if (adId === '' || lon === '' || lat === '' || price === '' || notes === '' || photoURL === '') {
            res.status(400);
            res.json({
                status: 400,
                message: config.statusMessages.dataInvalid
            });
            return;
        }

        var proposal = {
            userid: req.loggedUserId,
            adid: adId,
            price: price,
            notes: notes,
            lat: Math.floor(lat * config.geo.lonLatDBScale),
            lon: Math.floor(lon * config.geo.lonLatDBScale),
            photo: photoURL
        };

        var queryParams = [];
        var query = utils.genInsertIntoQuery('proposals', proposal, queryParams);

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
                        message: config.statusMessages.proposalPostSuccess,
                        proposalId: result.rows[0].id
                    });
                }
            });
        });
    },

    signS3: function (req, res) {
        var userid = req.loggedUserId;

        var filename = '' + Date.now() + userid + '.jpg';
        var isoDate = utils.toISOString(new Date());

        var signedURL = utils.genAWSS3Request(config.awsInfo.accessKeyID,
            config.awsInfo.accessKeySecret,
            config.awsInfo.bucketName,
            isoDate,
            filename);

        var imageURL = 'https://s3.amazonaws.com/' + config.awsInfo.bucketName + '/' + filename;

        res.json({
            signedUrl: signedURL,
            imageUrl: imageURL
        });
    }
};

module.exports = proposals;
