Session.setDefault("order_by", "Newest");
orderByDependency = new Tracker.Dependency;

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true
});

Session.set("ideasLoaded", false);

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

  Ideas.find({"author": { $ne: Meteor.userId() }}).observeChanges({
    added: function (id, idea) {
      if (Session.get("ideasLoaded")) {
        sAlert.info("New idea \"" + idea.title + "\" by " + idea.authorName);
      }
    }
  });

  Ideas.find({"author": { $ne: Meteor.userId() }}).observe({
    changed: function (newIdea, oldIdea) {
      if (!Session.get("ideasLoaded")) {
        return;
      }

      if (newIdea.title != oldIdea.title || newIdea.description != oldIdea.description) {
        // Edited title or description
        sAlert.info(newIdea.authorName + " edited the idea \"" + newIdea.title + "\"");
      }
    }
  });
});
