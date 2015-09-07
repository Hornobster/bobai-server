/**
 * Created by carlovespa on 03/09/15.
 */

var gcm = require('node-gcm');
var pg = require('pg');
var config = require('../config.js');

var sender = new gcm.Sender(config.gcmInfo.apiKey);

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

                        sender.send(message, registrationIds, function (err, result) {
                            if (err) {
                                console.error(err);
                            }
                            else {
                                console.log(result);
                            }
                        });
                    } else {
                        console.log('User is not GCM registered. Userid: ', userId);
                    }
                }
            });
        });
    }
};

module.exports = gcmutils;