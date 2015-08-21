Session.setDefault("order_by", "Newest");
orderByDependency = new Tracker.Dependency;

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true
});

Meteor.startup(function () {
  sAlert.config({
    effect: 'slide',
    position: 'top-right',
    timeout: 5000,
    html: false,
    onRouteClose: false,
    stack: true,
    offset: 10
  });

  Ideas.find({}).observeChanges({
    added: function (id, idea) {
      sAlert.info("New idea \"" + idea.title + "\" by " + idea.authorName);
    }
  });
});
