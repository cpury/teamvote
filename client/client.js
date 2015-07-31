Session.set("order_by", "Newest");
var orderByDependency = new Tracker.Dependency;

Template.listIdeas.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var projectId = FlowRouter.getParam("projectId");
    // TODO: Use projectId later on.
    self.subscribe("ideas");
  });
});

Template.listIdeas.helpers({
  ideas: function () {
    orderByDependency.depend();
    order_by = Session.get("order_by");

    if (order_by == "Newest") {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
    if (order_by == "Oldest") {
      return Ideas.find({}, {sort: {createdAt: +1}});
    }
    if (order_by == "Upvotes") {
      return Ideas.find({}, {sort: {upvoteCount: -1, createdAt: -1}});
    }
    if (order_by == "Comments") {
      return Ideas.find({}, {sort: {commentCount: -1, createdAt: -1}});
    }

    return Ideas.find({});
  }
});

Template.idea.helpers({
  rendered: function () {
  },
  ideaIsUpvoted: function (idea) {
    return idea.upvotes.indexOf(Meteor.userId()) != -1;
  },
  canDeleteIdea: function (idea) {
    return Meteor.userId() == idea.author;
  }
});

Template.comment.helpers({
  commentIsUpvoted: function (comment) {
    return comment.upvotes.indexOf(Meteor.userId()) != -1;
  },
  canDeleteComment: function (comment) {
    return Meteor.userId() == comment.author;
  }
});

Template.listIdeas.events({
  "submit .new-idea": function (event) {
    var title = event.target.title.value;
    var description = event.target.description.value;

    Meteor.call("addIdea", title, description);

    event.target.title.value = "";
    event.target.description.value = "";

    orderByDependency.changed();

    return false;
  },

  "submit .new-comment": function (event) {
    var text = event.target.text.value;

    Meteor.call("addComment", this._id, text);

    event.target.text.value = "";

    orderByDependency.changed();

    return false;
  },

  "change #order-by-form": function (event) {
    var order_by = event.target.value;

    Session.set("order_by", order_by);
    orderByDependency.changed();
  }
});

Template.idea.events({
  "click .delete-idea": function () {
    Meteor.call("deleteIdea", this._id);
  },
  "click .upvote-idea": function () {
    Meteor.call("upvoteIdea", this._id);
    orderByDependency.changed();
  }
});

Template.comment.events({
  "click .delete-comment": function () {
    Meteor.call("deleteComment", Template.parentData()._id, this._id);
    orderByDependency.changed();
  },
  "click .upvote-comment": function () {
    Meteor.call("upvoteComment", Template.parentData()._id, this._id);
    orderByDependency.changed();
  }
});

Template.newIdea.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});

Template.newComment.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true
});