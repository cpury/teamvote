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
    var title = event.target.title.value;
    var description = event.target.description.value;

    if (!title) {
      $('#newProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addProject", title, description, function (err, data) {
      if (err) {
        sAlert.error('Failed to add project...');
        console.log("Error while adding project:", err);
        return;
      }

      $('#newProjectModal').removeClass('fade');

      orderByDependency.changed();

      sAlert.success('Project added successfully');
      analytics.track("Add project", {
        title: this.title
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
    var id = Session.get("editProjectId");
    var title = event.target.title.value;
    var description = event.target.description.value;

    if (!title) {
      $('#editProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editProject", id, title, description, function (err, data) {
      if (err) {
        sAlert.error('Failed to edit project...');
        console.log("Error while editing project:", err);
        return;
      }

      sAlert.success('Project edited successfully');

      analytics.track("Edit project", {
        title: event.target.title.value
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
    Meteor.call("deleteProject", this._id, function (err, data) {
      if (err) {
        sAlert.error('Failed to delete project...');
        console.log("Error while deleting project:", err);
        return;
      }

      analytics.track("Delete project", {
        _id: this._id,
        title: this.title
      });

      sAlert.success('Project deleted successfully');
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
