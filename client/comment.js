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

Template.newComment.events({
  "submit .new-comment": function (event) {
    var text = event.target.text.value;

    Meteor.call("addComment", this._id, text);

    event.target.text.value = "";

    orderByDependency.changed();

    return false;
  }
})

Template.newComment.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});
