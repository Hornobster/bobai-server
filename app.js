/**
 * Created by carlovespa on 06/02/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config.js');

var app = express();

app.use(bodyParser.json({strict: true}));

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

app.all('/api/*', [require('./middleware/validateRequest.js')]);
app.all('/logout', [require('./middleware/validateRequest.js')]);

app.use('/', require('./routes/index.js'));

var server = app.listen(process.env.PORT || config.serverInfo.defaultPort, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log('Bobai listening at https://%s:%s', host, port);
});
