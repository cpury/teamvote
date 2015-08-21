Template.comment.helpers({
  commentIsUpvoted: function (comment) {
    return comment.upvotes.indexOf(Meteor.userId()) != -1;
  }
});

Template.comment.events({
  "click .delete-comment": function () {
    Meteor.call("deleteComment", Template.parentData()._id, this._id);

    orderByDependency.changed();

    sAlert.success('Comment deleted successfully');

    analytics.track("Delete comment", {
      _id: this._id,
      text: this.text
    });
  },
  "click .upvote-comment": function () {
    Meteor.call("upvoteComment", Template.parentData()._id, this._id);

    orderByDependency.changed();

    analytics.track("Toggle upvote comment", {
      _id: this._id,
      text: this.text
    });
  }
});

Template.newComment.events({
  "submit .new-comment": function (event) {
    var text = event.target.text.value;

    if (!text) {
      $('#newCommentText').focus();
      sAlert.error('Please provide a comment body');
      return false;
    }

    Meteor.call("addComment", this._id, text);

    event.target.text.value = "";

    orderByDependency.changed();

    sAlert.success('Comment added successfully');

    analytics.track("Add comment", {
      idea: this._id,
      text: text
    });

    return false;
  }
})

Template.newComment.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});
