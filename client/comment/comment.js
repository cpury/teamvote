Template.comment.helpers({
  commentIsUpvoted: function (comment) {
    return comment.upvotes.indexOf(Meteor.userId()) != -1;
  }
});

Template.comment.events({
  "click .delete-comment": function () {
    Meteor.call("deleteComment", Template.parentData()._id, this._id, function (err, data) {
      if (err) {
        sAlert.error('Failed to delete comment...');
        console.log("Error while deleting comment:", err);
        return;
      }

      orderByDependency.changed();

      sAlert.success('Comment deleted successfully');

      analytics.track("Delete comment", {
        _id: this._id,
        text: this.text
      });
    });
  },
  "click .upvote-comment": function () {
    Meteor.call("upvoteComment", Template.parentData()._id, this._id, function (err, data) {
      if (err) {
        sAlert.error('Failed to upvote comment...');
        console.log("Error while upvoting comment:", err);
        return;
      }

      orderByDependency.changed();

      analytics.track("Toggle upvote comment", {
        _id: this._id,
        text: this.text
      });
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

    Meteor.call("addComment", this._id, text, function (err, data) {
      if (err) {
        sAlert.error('Failed to add comment...');
        console.log("Error while adding comment:", err);
        return;
      }

      orderByDependency.changed();

      sAlert.success('Comment added successfully');

      analytics.track("Add comment", {
        idea: this._id,
        text: text
      });
    });

    event.target.text.value = "";

    return false;
  }
})

Template.newComment.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});
