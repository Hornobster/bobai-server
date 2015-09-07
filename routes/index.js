/**
 * Created by carlovespa on 06/02/15.
 */

var express = require('express');
var router = express.Router();

var auth = require('./auth.js');
var registration = require('./registration.js');
var proposals = require('./proposals.js');
var ads = require('./ads.js');
var categories = require('./categories.js');
var messages = require('./messages.js');
var info = require('./info.js');

/*
routes that can be accessed by anyone
 */
router.post('/login', auth.login);
router.post('/signup', registration.signup);

/*
routes that can be accessed only by authenticated users
 */
router.post('/logout', auth.logout);

router.get('/api/proposalsOf/:userid', proposals.getByUserId);
router.get('/api/proposals/:adid/:lat/:lon', proposals.getByAdId);
router.get('/api/adsNearby/:lat/:lon/:limit', ads.getNearby);
router.get('/api/ads/:id', ads.getById);
router.get('/api/adsOf/:userid', ads.getByUserId);
router.get('/api/categories', categories.getCategories);
router.get('/api/signS3', proposals.signS3);
router.get('/api/messages/:propid', messages.getAllMessages);
router.get('/api/messages/:propid/unread', messages.getUnreadMessages);
router.get('/api/username/:userid', info.getUsername);
router.get('/api/username/prop/:propid', info.getPropOwnerUsername);
router.get('/api/username/ad/:adid', info.getAdOwnerUsername);

router.post('/api/ads', ads.postAd);
router.post('/api/proposals', proposals.postProposal);
router.post('/api/messages/register', messages.registerGCMClient);
router.post('/api/messages/:propid', messages.postMessage);

/*
routes that can be accessed only by authenticated and authorized users
 */

// TODO

module.exports = router;
