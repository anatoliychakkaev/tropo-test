load('application');

before(loadMessage, {only: ['show', 'edit', 'update', 'destroy']});

action('new', function () {
    this.title = 'New message';
    this.message = new Message;
    render();
});

action(function create() {
    Message.create(req.body.Message, function (err, message) {
        if (err) {
            flash('error', 'Message can not be created');
            render('new', {
                message: message,
                title: 'New message'
            });
        } else {
            flash('info', 'Message created');
            redirect(path_to.messages());
        }
    });
});

action(function index() {
    this.title = 'Messages index';
    Message.all(function (err, messages) {
        render({
            messages: messages
        });
    });
});

action(function show() {
    this.title = 'Message show';
    render();
});

action(function edit() {
    this.title = 'Message edit';
    render();
});

action(function update() {
    this.message.updateAttributes(body.Message, function (err) {
        if (!err) {
            flash('info', 'Message updated');
            redirect(path_to.message(this.message));
        } else {
            flash('error', 'Message can not be updated');
            this.title = 'Edit message details';
            render('edit');
        }
    }.bind(this));
});

action(function destroy() {
    this.message.destroy(function (error) {
        if (error) {
            flash('error', 'Can not destroy message');
        } else {
            flash('info', 'Message successfully removed');
        }
        send("'" + path_to.messages() + "'");
    });
});

function loadMessage() {
    Message.find(params.id, function (err, message) {
        if (err || !message) {
            redirect(path_to.messages());
        } else {
            this.message = message;
            next();
        }
    }.bind(this));
}
