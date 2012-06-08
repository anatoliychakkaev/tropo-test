var tropoSessions = {};
var tropoSessionsIndex = {};
var https = require('https');
var API = require('tropo-webapi');
var tropo = new TropoWebAPI();
var token = '124cdb4120bef148a47b0e84a7eabe335c19828a326fcb47c6aa4c0565948b2692d5570d64f7a8f5dd047e90';

app.startTropoSession = function (message, callback) {
    tropoSessions[message.id] = {
        message: message,
        callback: callback
    };

    var req = https.request({
        method: 'GET',
        host: 'api.tropo.com',
        port: 443,
        path: '/1.0/sessions?action=create&token=' + token + '&messageId=' + message.id
    }, function (res) {
        console.log('Tropo session for', message.id, 'started');
        // res.on('data', console.log);
    });
    req.on('error', console.log);
    req.end();
};

var callbacks = ['incomplete', 'hangup', 'error', 'continue'];

app.post('/tropo/text', function (req, res) {

    console.log('send tropo task');

    var messageId = req.body.session.parameters.messageId;
    var sessionId = req.body.session.id;
    var session = tropoSessions[messageId];
    var message = session.message;
    tropoSessionsIndex[sessionId] = messageId;

    // tropo.call(to, null, null, null, null, null, "SMS", null, null, null);
    tropo.call(message.phone);
    tropo.say(message.message);
    callbacks.forEach(function (callback) {
        tropo.on(callback, null, '/tropo/callback/' + callback, true);
    });

    res.send(TropoJSON(tropo));

});

callbacks.forEach(function (callback) {
    app.post('/tropo/callback/' + callback, callbackHandler(callback));
});

function callbackHandler(callback) {
    return function (req, res) {
        var sessionId = req.body.result.sessionId;
        var messageId = tropoSessionsIndex[sessionId];
        var session = tropoSessions[messageId];
        req.body.result.callback = callback;
        session.callback.send(req.body.result);
        // delete tropoSessions[messageId];
        // delete tropoSessionsIndex[sessionId];
        res.send(200);
    };
}

app.post('/messages', function (req, res) {

    app.models.Message.create(req.body.Message, function (err, message) {
        if (err) {
            flash('error', 'Message can not be created');
            render('new', {
                message: message,
                title: 'New message'
            });
        } else {
            message.send(res);
        }
    });
});

