/**
 * Created by carlovespa on 03/09/15.
 */

var gcm = require('node-gcm');
var pg = require('pg');
var config = require('../config.js');

var senderAndroid = new gcm.Sender(config.gcmInfo.apiKeyAndroid);
var senderIOS = new gcm.Sender(config.gcmInfo.apiKeyIos);

var gcmutils = {
    sendMessageNotificationToUserId: function (userId, title, text, propId) {
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            client.query('SELECT registrationid FROM gcm WHERE userid=$1', [userId], function (err, result) {
                done();
                if (err) {
                    console.error(err);
                }
                else {
                    if (result.rows[0]) {
                        var registrationId = result.rows[0].registrationid;
                        var os = result.rows[0].os;

                        var message = new gcm.Message();

                        message.addData({
                            title: title,
                            message: text,
                            summaryText: '%n% nuovi messaggi.',
                            style: 'inbox',
                            notId: propId,
                            image: "https://s3.amazonaws.com/bobai-uploads/bobai.png"
                        });

                        var registrationIds = [];
                        registrationIds.push(registrationId);

                        if (os == 'A') {
                            senderAndroid.send(message, registrationIds, function (err, result) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log(result);
                                }
                            });
                        }

                        if (os == 'I') {
                            senderIOS.send(message, registrationIds, function (err, result) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log(result);
                                }
                            });
                        }
                    } else {
                        console.log('User is not GCM registered. Userid: ', userId);
                    }
                }
            });
        });
    }
};

module.exports = gcmutils;