require('../test_helper.js').controller('messages', module.exports);

var sinon  = require('sinon');

function ValidAttributes () {
    return {
        firstname: '',
        lastname: '',
        phone: '',
        message: ''
    };
}

exports['messages controller'] = {

    'GET new': function (test) {
        test.get('/messages/new', function () {
            test.success();
            test.render('new');
            test.render('form.' + app.set('view engine'));
            test.done();
        });
    },

    'GET index': function (test) {
        test.get('/messages', function () {
            test.success();
            test.render('index');
            test.done();
        });
    },

    'GET edit': function (test) {
        var find = Message.find;
        Message.find = sinon.spy(function (id, callback) {
            callback(null, new Message);
        });
        test.get('/messages/42/edit', function () {
            test.ok(Message.find.calledWith('42'));
            Message.find = find;
            test.success();
            test.render('edit');
            test.done();
        });
    },

    'GET show': function (test) {
        var find = Message.find;
        Message.find = sinon.spy(function (id, callback) {
            callback(null, new Message);
        });
        test.get('/messages/42', function (req, res) {
            test.ok(Message.find.calledWith('42'));
            Message.find = find;
            test.success();
            test.render('show');
            test.done();
        });
    },

    'POST create': function (test) {
        var message = new ValidAttributes;
        var create = Message.create;
        Message.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, message);
            callback(null, message);
        });
        test.post('/messages', {Message: message}, function () {
            test.redirect('/messages');
            test.flash('info');
            test.done();
        });
    },

    'POST create fail': function (test) {
        var message = new ValidAttributes;
        var create = Message.create;
        Message.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, message);
            callback(new Error, message);
        });
        test.post('/messages', {Message: message}, function () {
            test.success();
            test.render('new');
            test.flash('error');
            test.done();
        });
    },

    'PUT update': function (test) {
        Message.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(null); }});
        });
        test.put('/messages/1', new ValidAttributes, function () {
            test.redirect('/messages/1');
            test.flash('info');
            test.done();
        });
    },

    'PUT update fail': function (test) {
        Message.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(new Error); }});
        });
        test.put('/messages/1', new ValidAttributes, function () {
            test.success();
            test.render('edit');
            test.flash('error');
            test.done();
        });
    },

    'DELETE destroy': function (test) {
        test.done();
    },

    'DELETE destroy fail': function (test) {
        test.done();
    }
};

