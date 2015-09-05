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

Template.project.helpers({
  toUrl: function (projectId) {
    return String(projectId);
  }
});

Template.newProject.events({
  "submit #new-project": function (event) {
    var newProjectTitle = event.target.title.value;
    var newProjectDescription = event.target.description.value;

    if (!newProjectTitle) {
      $('#newProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addProject", newProjectTitle, newProjectDescription, function (err, data) {
      if (err) {
        sAlert.error('Failed to add project...');
        console.log("Error while adding project:", err);
        return;
      }

      $('#newProjectModal').removeClass('fade');

      orderByDependency.changed();

      sAlert.success('Project added successfully');
      analytics.track("Add project", {
        "title": newProjectTitle
      });

      FlowRouter.go('/' + data + '/');
    });

    event.target.title.value = "";
    event.target.description.value = "";

    $('#newProjectModal').modal('hide');

    return false;
  }
});

Template.editProjectModal.events({
  "submit #edit-project": function (event) {
    var editProjectId = Session.get("editProjectId");
    var editProjectTitle = event.target.title.value;
    var editProjectDescription = event.target.description.value;

    if (!editProjectTitle) {
      $('#editProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editProject", editProjectId, editProjectTitle, editProjectDescription, function (err, data) {
      if (err) {
        sAlert.error('Failed to edit project...');
        console.log("Error while editing project:", err);
        return;
      }

      sAlert.success('Project edited successfully');

      analytics.track("Edit project", {
        "id": editProjectId,
        "title": editProjectTitle
      });
    });

    event.target.title.value = "";
    event.target.description.value = "";
    Session.set("editProjectId", undefined);

    $('#editProjectModal').modal('hide');

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
    var deleteProjectId = this._id;
    var deleteProjectTitle = this.title;

    bootbox.confirm("Are you sure you want to delete \"" + deleteProjectTitle + "\"?", function(result) {
      if (!result) {
        return;
      }

      Meteor.call("deleteProject", deleteProjectId, function (err, data) {
        if (err) {
          sAlert.error('Failed to delete project...');
          console.log("Error while deleting project:", err);
          return;
        }

        analytics.track("Delete project", {
          _id: deleteProjectId,
          title: deleteProjectTitle
        });

        sAlert.success('Project deleted successfully');
      });
    });
  }
});

Template.welcome.events({
  "click .toggle-signup": function () {
    if(!Meteor.userId()) {
      if($('.navbar-toggle').is(':visible') && !$('.navbar-collapse').hasClass('in')) {
        $('.navbar-toggle').click();
      }
      $('#signup-link').click();
      if (!$('#login-dropdown-list').hasClass('open')) {
        Template._loginButtons.toggleDropdown();
      }
    }
    return false;
  },
  "click .toggle-login": function () {
    if(!Meteor.userId()) {
      if($('.navbar-toggle').is(':visible') && !$('.navbar-collapse').hasClass('in')) {
        $('.navbar-toggle').click();
      }
      $('#back-to-login-link').click();
      if(!$('#login-dropdown-list').hasClass('open')) {
        Template._loginButtons.toggleDropdown();
      }
    }
    return false;
  }
});

Template.newProject.onRendered(function() {
  $('#newProjectModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
      alwaysShow: true
    });
    setTimeout(function(){ $('#newProjectTitle').focus(); }, 150);
  });
});

Template.editProjectModal.onRendered(function() {
  $('#editProjectModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
      alwaysShow: true
    });
    setTimeout(function(){ $('#editProjectTitle').focus(); }, 150);
  });
});

Template.projectToolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('#new-project-button').popover();
  }
});
