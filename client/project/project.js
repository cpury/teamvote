Template.listProjects.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe("projects", function () {
      Session.set("projectsLoaded", true);
    });
  });
});

Template.listProjects.helpers({
  projects: function () {
    return Projects.find({});
  }
});

Template.newProject.events({
  "submit #new-project": function (event) {
    var title = event.target.title.value;
    var description = event.target.description.value;

    if (!title) {
      $('#newProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addProject", title, description);

    event.target.title.value = "";
    event.target.description.value = "";

    $('#newProjectModal').modal('hide');

    orderByDependency.changed();

    sAlert.success('Project added successfully');

    analytics.track("Add project", {
      title: this.title
    });

    return false;
  }
});

Template.editProjectModal.events({
  "submit #edit-project": function (event) {
    var id = Session.get("editProjectId");
    var title = event.target.title.value;
    var description = event.target.description.value;

    if (!title) {
      $('#editProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editProject", id, title, description);

    event.target.title.value = "";
    event.target.description.value = "";
    Session.set("editProjectId", undefined);

    $('#editProjectModal').modal('hide');

    sAlert.success('Project edited successfully');

    analytics.track("Edit project", {
      title: event.target.title.value
    });

    return false;
  }
});

Template.project.events({
  "click .edit-project": function () {
    Session.set("editProjectId", this._id);
    $('#editProjectModal').modal('show');
    $('#editProjectTitle').val(this.title);
    $('#editProjectDescription').val(this.description);
  },
  "click .delete-project": function () {
    Meteor.call("deleteProject", this._id);
    analytics.track("Delete project", {
      _id: this._id,
      title: this.title
    });
    sAlert.success('Project deleted successfully');
  }
});

Template.newProject.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
  $('#newProjectModal').on('shown.bs.modal', function() {
    $('#newProjectTitle').focus();
  });
});

Template.projectToolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('#new-project-button').popover();
  }
});
