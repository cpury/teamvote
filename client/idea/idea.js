Meteor.subscribe("onlineUsers");

Template.listIdeas.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var projectId = FlowRouter.getParam("projectId");
    self.subscribe("ideas", projectId, function () {
      Session.set("ideasLoaded", true);
    });
    self.subscribe("projects");
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
    return Session.equals('order_by', value) ? 'active' : '';
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
    var title = event.target.title.value;
    var description = event.target.description.value;
    var currentProject = Session.get("currentProject");

    if (!title) {
      $('#newIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addIdea", currentProject, title, description, function (err, data) {
      if (err) {
        sAlert.error('Failed to add idea...');
        console.log("Error while adding idea:", err);
        return;
      }

      orderByDependency.changed();

      sAlert.success('Idea added successfully');

      analytics.track("Add idea", {
        title: this.title
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
    var id = Session.get("editIdeaId");
    var title = event.target.title.value;
    var description = event.target.description.value;

    if (!title) {
      $('#editIdeaTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editIdea", id, title, description, function (err, data) {
      if (err) {
        sAlert.error('Failed to edit idea...');
        console.log("Error while editing idea:", err);
        return;
      }

      sAlert.success('Idea edited successfully');

      analytics.track("Edit idea", {
        title: event.target.title.value
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
    Meteor.call("deleteIdea", this._id, function (err, data) {
      if (err) {
        sAlert.error('Failed to delete idea...');
        console.log("Error while deleting idea:", err);
        return;
      }

      sAlert.success('Idea deleted successfully');
      analytics.track("Delete idea", {
        _id: this._id,
        title: this.title
      });
    });
  },
  "click .upvote-idea": function () {
    Meteor.call("upvoteIdea", this._id, function (err, data) {
      if (err) {
        sAlert.error('Failed to upvote idea...');
        console.log("Error while upvoting idea:", err);
        return;
      }

      orderByDependency.changed();
      analytics.track("Toggle upvote idea", {
        _id: this._id,
        title: this.title
      });
    });
  }
});

Template.orderBy.events({
  "change .orderByButton": function (event) {
    var order_by = event.target.id;

    Session.set("order_by", order_by);
    orderByDependency.changed();

    analytics.track("Changed ordering", {
      newOrdering: order_by
    });
  }
});

Template.ideaHeading.onRendered(function() {
  if (!Meteor.userId()) {
    $('.upvote-idea').popover();
  }
});

Template.newIdea.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
  $('#newIdeaModal').on('shown.bs.modal', function() {
    $('#newIdeaTitle').focus();
  });
});

Template.ideaToolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('#new-idea-button').popover();
  }
});
