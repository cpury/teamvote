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

  Ideas.find({"authorId": { $ne: Meteor.userId() }}).observeChanges({
    added: function (id, idea) {
      if (Session.get("ideasLoaded")) {
        sAlert.info("New idea \"" + idea.title + "\" by " + idea.authorName);
      }
    }
  });

  Ideas.find({}).observe({
    changed: function (newIdea, oldIdea) {
      if (!Session.get("ideasLoaded")) {
        return;
      }

      if (newIdea.authorId != Meteor.userId() && (newIdea.title != oldIdea.title || newIdea.description != oldIdea.description)) {
        // Edited title or description
        sAlert.info(newIdea.authorName + " edited the idea \"" + newIdea.title + "\"");
      }

      if (newIdea.commentCount > oldIdea.commentCount) {
        // Added a new comment
        newComment = newIdea.comments[0];
        if (newComment.authorId != Meteor.userId()) {
          sAlert.info(newComment.authorName + " added a comment to \"" + newIdea.title + "\"");
        }
      }

      if (newIdea.commentCount < oldIdea.commentCount) {
        // Deleted a comment
        deletedComment = oldIdea.comments.filter(function (current) {
          return newIdea.comments.filter(function (current_new) {
            return current_new._id == current._id;
          }).length == 0;
        })[0];
        if (deletedComment.authorId != Meteor.userId()) {
          sAlert.info(deletedComment.authorName + " deleted a comment to \"" + newIdea.title + "\"");
        }
      }
    },
    removed: function (oldIdea) {
      if (!Session.get("ideasLoaded") || oldIdea.authorId == Meteor.userId()) {
        return;
      }

      sAlert.info(oldIdea.authorName + " removed the idea \"" + oldIdea.title + "\"");
    }
  });
});
