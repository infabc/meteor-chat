Messages = new Mongo.Collection('messages');
if (Meteor.isClient) {
  Meteor.subscribe('messages', 5);

  Template.hello.helpers({
    messages: function () {
      return Messages.find({}, {
        sort: { timestamp: -1 }
      });
    }
  });

  Template.hello.events({
    'submit .chat-form': function (evt) {
      evt.preventDefault();
      var text = evt.target.message.value;
      console.log(text);
      Meteor.call('insertMessage', text, function(err, result) {
        if (err) {
          console.log(err);
          alert(err.reason);
        } else {
          console.log('Message inserted with ID: ', result);
          evt.target.message.value = '';
        }
      });
    }
  });
  
  Template.register.events({
'submit form': function(event, template){
    event.preventDefault();
    var userVar = template.find('#register-user').value;
    var emailVar = template.find('#register-email').value;
    var passwordVar = template.find('#register-password').value;
    Accounts.createUser({
    	username: userVar,
        email: emailVar,
        password: passwordVar
    });
}
});

Template.login.events({
'submit form': function(event, template){
    event.preventDefault();
    
    var emailVar = template.find('#login-email').value;
    var passwordVar = template.find('#login-password').value;
    Meteor.loginWithPassword(emailVar, passwordVar);
}
});
  
  Template.dashboard.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
    }
});

  
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    insertMessage: function(text) {
      if (!this.userId) {
        throw new Meteor.Error("logged-out",
          "Użytkownik musi być zalogowany, aby wysłać wiadomość.");
      }
      var user = Meteor.users.findOne(this.userId);
      return Messages.insert({
        userId: this.userId,
        username: user.username,
        text: text,
        timestamp: Date.now()
      });
    }
  });

  Meteor.publish('messages', function(limit) {
    //publish messages just for logged in user
    if (this.userId) {
      return Messages.find({}, {
        limit: limit || 5,
        sort: { timestamp: -1 }
      });
    }
    this.ready();
  });
  
  Meteor.publish('files', function() {
        return Files.find();
    });
    
}