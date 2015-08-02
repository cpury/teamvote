Template.comment.helpers({
  commentIsUpvoted: function (comment) {
    return comment.upvotes.indexOf(Meteor.userId()) != -1;
  },
  canDeleteComment: function (comment) {
    return Meteor.userId() == comment.author;
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

Template.newComment.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});
