Message.prototype.send = function (done) {
    app.startTropoSession(this, done);
};
