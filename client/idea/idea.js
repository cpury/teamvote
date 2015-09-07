Meteor.subscribe("onlineUsers");

Template.listIdeas.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var projectId = FlowRouter.getParam("projectId");
    self.subscribe("currentProject", projectId, function () {
      if (!Projects.findOne(projectId)) {
        Session.set("currentProjectId", null);
        BlazeLayout.render('404');
      }
    });
    self.subscribe("ideas", projectId, function () {
      Session.set("ideasLoaded", true);
    });
  });
});

Template.listIdeas.helpers({
  ideas: function () {
    ideaDependency.depend();
    orderBy = Session.get("ideaOrder");

    if (orderBy == "Newest") {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
    if (orderBy == "Oldest") {
      return Ideas.find({}, {sort: {createdAt: +1}});
    }
    if (orderBy == "Upvotes") {
      return Ideas.find({}, {sort: {upvoteCount: -1, createdAt: -1}});
    }
    if (orderBy == "Comments") {
      return Ideas.find({}, {sort: {commentCount: -1, createdAt: -1}});
    }

    return Ideas.find({});
  }
});

Template.projectHeading.helpers({
  projectHeadingClass: function (project) {
    if (project.active) {
      return "panel-info";
    } else {
      return "panel-primary";
    }
  }
});

Template.ideaHeading.helpers({
  ideaIsUpvoted: function (idea) {
    return idea.upvotes.indexOf(Meteor.userId()) != -1;
  }
});

Template.ideaOrder.helpers({
  isSelected: function (value) {
    return Session.equals('ideaOrder', value) ? 'active' : '';
  }
});

Template.onlineUserList.helpers({
  onlineUsers: function () {
    return Meteor.users.find({ "status.online": true }, { "username": 1 });
  }
});

Template.projectHeading.events({
  "shown.bs.collapse #projectHeading": function () {
    $("#projectHeading .collapseArrow").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-left");
  },
  "hidden.bs.collapse #projectHeading": function () {
    $("#projectHeading .collapseArrow").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-down");
  }
});

Template.newIdea.events({
  "submit #new-idea": function (event) {
    var newIdeaProjectId = Session.get("currentProjectId");
    var newIdeaTitle = event.target.title.value;
    var newIdeaDescription = event.target.description.value;

    if (!newIdeaTitle) {
      $('#newIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addIdea", newIdeaProjectId, newIdeaTitle, newIdeaDescription, function (err, data) {
      if (err) {
        if (err.error === "duplicate-key") {
          sAlert.error(err.reason);
          return;
        }

        sAlert.error('Failed to add idea...');
        console.log("Error while adding idea:", err);
        return;
      }

      ideaDependency.changed();

      sAlert.success('Idea added successfully');

      analytics.track("Add idea", {
        title: newIdeaTitle
      });
    });

    event.target.title.value = "";
    event.target.description.value = "";

    $('#newIdeaModal').modal('hide');

    return false;
  }
});

Template.editIdeaModal.events({
  "submit #edit-idea": function (event) {
    var editIdeaProjectId = Session.get("currentProjectId");
    var editIdeaId = Session.get("editIdeaId");
    var editIdeaTitle = event.target.title.value;
    var editIdeaDescription = event.target.description.value;

    if (!editIdeaTitle) {
      $('#editIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editIdea", editIdeaProjectId, editIdeaId, editIdeaTitle, editIdeaDescription, function (err, data) {
      if (err) {
        if (err.error === "duplicate-key") {
          sAlert.error(err.reason);
          return;
        }

        sAlert.error('Failed to edit idea...');
        console.log("Error while editing idea:", err);
        return;
      }

      sAlert.success('Idea edited successfully');

      analytics.track("Edit idea", {
        id: editIdeaId,
        title: editIdeaTitle
      });
    });

    event.target.title.value = "";
    event.target.description.value = "";
    Session.set("editIdeaId", undefined);

    $('#editIdeaModal').modal('hide');

    return false;
  }
});

Template.idea.events({
  "click .edit-idea": function () {
    Session.set("editIdeaId", this._id);
    $('#editIdeaModal').modal('show');
    $('#editIdeaTitle').val(this.title);
    $('#editIdeaDescription').val(this.description);
  },
  "click .delete-idea": function () {
    var deleteIdeaProjectId = Session.get("currentProjectId");
    var deleteIdeaId = this._id;
    var deleteIdeaTitle = this.title;

    bootbox.confirm("Are you sure you want to delete \"" + deleteIdeaTitle + "\"?", function(result) {
      if (!result) {
        return;
      }

      Meteor.call("deleteIdea", deleteIdeaProjectId, deleteIdeaId, function (err, data) {
        if (err) {
          sAlert.error('Failed to delete idea...');
          console.log("Error while deleting idea:", err);
          return;
        }

        sAlert.success('Idea deleted successfully');
        analytics.track("Delete idea", {
          _id: deleteIdeaId,
          title: deleteIdeaTitle
        });
      });
    });
  },
  "click .upvote-idea": function () {
    if (!Meteor.userId() || !Blaze._globalHelpers['currentProject'].active) {
      return;
    }

    var upvoteIdeaProjectId = Session.get("currentProjectId");
    var upvoteIdeaId = this._id;
    var upvoteIdeaTitle = this.title;

    Meteor.call("upvoteIdea", upvoteIdeaProjectId, upvoteIdeaId, function (err, data) {
      if (err) {
        sAlert.error('Failed to upvote idea...');
        console.log("Error while upvoting idea:", err);
        return;
      }

      ideaDependency.changed();
      analytics.track("Toggle upvote idea", {
        _id: upvoteIdeaId,
        title: upvoteIdeaTitle
      });
    });
  }
});

Template.ideaOrder.events({
  "change .orderByButton": function (event) {
    var orderBy = event.target.id;

    Session.set("ideaOrder", orderBy);
    ideaDependency.changed();
  }
});

Template.ideaHeading.onRendered(function() {
  if (!Meteor.userId()) {
    $('.upvote-idea').popover();
  }
});

Template.newIdea.onRendered(function() {
  $('#newIdeaModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
      alwaysShow: true
    });
    $('textarea[maxlength]').maxlength({
      alwaysShow: true
    });
    setTimeout(function(){ $('#newIdeaTitle').focus(); }, 150);
  });
});

Template.editIdeaModal.onRendered(function() {
  $('#editIdeaModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
      alwaysShow: true
    });
    $('textarea[maxlength]').maxlength({
      alwaysShow: true
    });
    setTimeout(function(){ $('#editIdeaTitle').focus(); }, 150);
  });
});

Template.ideaToolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('#new-idea-button').popover();
  }
});
