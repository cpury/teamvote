Meteor.subscribe("onlineUsers");

Template.listIdeas.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var projectId = FlowRouter.getParam("projectId");
    self.subscribe("currentProject", projectId, function () {
      if (!Projects.findOne(projectId)) {
        Session.set("currentProject", null);
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
    orderByDependency.depend();
    orderBy = Session.get("orderBy");

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
  project: function () {
    projectId = Session.get("currentProject");
    return Projects.findOne(projectId);
  }
});

Template.ideaHeading.helpers({
  ideaIsUpvoted: function (idea) {
    return idea.upvotes.indexOf(Meteor.userId()) != -1;
  }
});

Template.orderBy.helpers({
  isSelected: function (value) {
    return Session.equals('orderBy', value) ? 'active' : '';
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
    var newIdeaTitle = event.target.title.value;
    var newIdeaDescription = event.target.description.value;
    var currentProject = Session.get("currentProject");

    if (!newIdeaTitle) {
      $('#newIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addIdea", currentProject, newIdeaTitle, newIdeaDescription, function (err, data) {
      if (err) {
        sAlert.error('Failed to add idea...');
        console.log("Error while adding idea:", err);
        return;
      }

      orderByDependency.changed();

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
    var editIdeaId = Session.get("editIdeaId");
    var editIdeaTitle = event.target.title.value;
    var editIdeaDescription = event.target.description.value;

    if (!editIdeaTitle) {
      $('#editIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editIdea", editIdeaId, editIdeaTitle, editIdeaDescription, function (err, data) {
      if (err) {
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
    var deleteIdeaId = this._id;
    var deleteIdeaTitle = this.title;

    Meteor.call("deleteIdea", deleteIdeaId, function (err, data) {
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
  },
  "click .upvote-idea": function () {
    var upvoteIdeaId = this._id;
    var upvoteIdeaTitle = this.title;

    Meteor.call("upvoteIdea", upvoteIdeaId, function (err, data) {
      if (err) {
        sAlert.error('Failed to upvote idea...');
        console.log("Error while upvoting idea:", err);
        return;
      }

      orderByDependency.changed();
      analytics.track("Toggle upvote idea", {
        _id: upvoteIdeaId,
        title: upvoteIdeaTitle
      });
    });
  }
});

Template.orderBy.events({
  "change .orderByButton": function (event) {
    var orderBy = event.target.id;

    Session.set("orderBy", orderBy);
    orderByDependency.changed();

    analytics.track("Changed ordering", {
      newOrdering: orderBy
    });
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
    setTimeout(function(){ $('#newIdeaTitle').focus(); }, 150);
  });
});

Template.editIdeaModal.onRendered(function() {
  $('#editIdeaModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
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
