Meteor.subscribe("ideas");

Template.registerHelper("formatDate", function (date) {
  return moment(date).fromNow();
});

Template.body.helpers({
  ideas: function () {
    return Ideas.find({}, {sort: {createdAt: -1}});
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

Template.body.events({
  "submit .new-idea": function (event) {
    var title = event.target.title.value;
    var description = event.target.description.value;

    Meteor.call("addIdea", title, description);

    event.target.title.value = "";
    event.target.description.value = "";

    return false;
  },

  "submit .new-comment": function (event) {
    var text = event.target.text.value;

    Meteor.call("addComment", this._id, text);

    event.target.text.value = "";

    return false;
  }
});

Template.idea.events({
  "click .delete-idea": function () {
    Meteor.call("deleteIdea", this._id);
  },
  "click .upvote-idea": function () {
    Meteor.call("upvoteIdea", this._id);
  }
});

Template.comment.events({
  "click .delete-comment": function () {
    Meteor.call("deleteComment", Template.parentData()._id, this);
  },
  "click .upvote-comment": function () {
    Meteor.call("upvoteComment", Template.parentData()._id, this);
  }
});

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true
});
