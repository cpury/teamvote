Template.comment.helpers({
  commentIsUpvoted: function (comment) {
    return comment.upvotes.indexOf(Meteor.userId()) != -1;
  }
});

Template.comment.events({
  "click .delete-comment": function () {
    var deleteCommentProjectId = Session.get("currentProject");
    var deleteCommentIdeaId = Template.parentData()._id;
    var deleteCommentId = this._id;
    var deleteCommentText = this.text;

    Meteor.call("deleteComment", deleteCommentProjectId, deleteCommentIdeaId, deleteCommentId, function (err, data) {
      if (err) {
        sAlert.error('Failed to delete comment...');
        console.log("Error while deleting comment:", err);
        return;
      }

      ideaDependency.changed();

      sAlert.success('Comment deleted successfully');

      analytics.track("Delete comment", {
        _id: deleteCommentId,
        text: deleteCommentText
      });
    });
  },
  "click .upvote-comment": function () {
    var upvoteCommentProjectId = Session.get("currentProject");
    var upvoteCommentIdeaId = Template.parentData()._id;
    var upvoteCommentId = this._id;
    var upvoteCommentText = this.text;

    Meteor.call("upvoteComment", upvoteCommentProjectId, upvoteCommentIdeaId, upvoteCommentId, function (err, data) {
      if (err) {
        sAlert.error('Failed to upvote comment...');
        console.log("Error while upvoting comment:", err);
        return;
      }

      ideaDependency.changed();

      analytics.track("Toggle upvote comment", {
        _id: upvoteCommentId,
        text: upvoteCommentText
      });
    });
  }
});

Template.newComment.events({
  "submit .new-comment": function (event) {
    var addCommentProjectId = Session.get("currentProject");
    var addCommentIdeaId = this._id;
    var addCommenttext = event.target.text.value;

    if (!addCommenttext) {
      $('#newCommentText').focus();
      sAlert.error('Please provide a comment body');
      return false;
    }

    Meteor.call("addComment", addCommentProjectId, addCommentIdeaId, addCommenttext, function (err, data) {
      if (err) {
        sAlert.error('Failed to add comment...');
        console.log("Error while adding comment:", err);
        return;
      }

      ideaDependency.changed();

      sAlert.success('Comment added successfully');

      analytics.track("Add comment", {
        idea: addCommentIdeaId,
        text: addCommenttext
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
