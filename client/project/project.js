var projectModalPrivateInfoUpdate = function (object, private) {
  if (private) {
    object.text("Only people with the URL can join");
  } else {
    object.text("Anyone can find and join");
  }
};

Template.listProjects.onCreated(function () {
  var self = this;
  self.autorun(function () {
    self.subscribe("publicProjects", function () {
      Session.set("projectsLoaded", true);
    });
  });
});

Template.listProjects.helpers({
  projects: function () {
    projectDependency.depend();
    return Projects.find({}, {sort: {active: -1}});
  }
});

Template.project.helpers({
  toUrl: function (projectId) {
    return String(projectId);
  },
  projectListItemClass: function () {
    if (this.active) {
      return "active-project-list-item";
    } else {
      return "inactive-project-list-item";
    }
  }
});

Template.projectToolbar.events({
  "click #new-project-button": function () {
    $('#newProjectModal').modal('show');
  }
});

Template.newProjectModal.events({
  "change #newProjectPrivate": function (event) {
    projectModalPrivateInfoUpdate($('#newProjectPrivateInfo'), event.target.checked);
  },
  "submit #new-project": function (event) {
    var newProjectTitle = event.target.title.value;
    var newProjectDescription = event.target.description.value;
    var newProjectPrivate = false;

    if (!newProjectTitle) {
      $('#newProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("addProject", newProjectTitle, newProjectDescription, newProjectPrivate, function (err, data) {
      if (err) {
        if (err.error === "duplicate-key") {
          sAlert.error(err.reason);
          return;
        }

        sAlert.error('Failed to add project...');
        console.log("Error while adding project:", err);
        return;
      }

      $('#newProjectModal').removeClass('fade');

      projectDependency.changed();

      sAlert.success('Project added successfully');
      analytics.track("Add project", {
        "title": newProjectTitle,
        "private": newProjectPrivate
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
  "change #editProjectPrivate": function (event) {
    projectModalPrivateInfoUpdate($('#editProjectPrivateInfo'), event.target.checked);
  },
  "submit #edit-project": function (event) {
    var editProjectId = Session.get("editProjectId");
    var editProjectTitle = event.target.title.value;
    var editProjectDescription = event.target.description.value;
    var editProjectPrivate = event.target.private.checked;

    if (!editProjectTitle) {
      $('#editProjectTitle').focus();
      sAlert.error('Please provide a title');
      return false;
    }

    Meteor.call("editProject", editProjectId, editProjectTitle, editProjectDescription, editProjectPrivate, function (err, data) {
      if (err) {
        if (err.error === "duplicate-key") {
          sAlert.error(err.reason);
          return;
        }

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
    $('#editProjectPrivate').prop('checked', this.private);
    projectModalPrivateInfoUpdate($('#editProjectPrivateInfo'), this.private);
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

Template.projectButtons.events({
  "change .project-state :checkbox": function (event) {
    var changeProjectStateProjectId = this._id;
    var changeProjectState = event.target.checked;
    Meteor.call("setActiveProject", changeProjectStateProjectId, changeProjectState, function (err, data) {
      if (err) {
        sAlert.error('Failed to set project state...');
        console.log("Error while setting project state:", err);
        return;
      }

      if (changeProjectState) {
        analytics.track("Activate project", {
          _id: changeProjectStateProjectId
        });
        sAlert.success('Project activated successfully');
      } else {
        analytics.track("Deactivate project", {
          _id: changeProjectStateProjectId
        });
        sAlert.success('Project deactivated successfully');
      }

      projectDependency.changed();
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
  $('#newProjectPrivate').checkboxpicker({
    offLabel: "Public",
    offIconClass: "glyphicon glyphicon-globe",
    onLabel: "Private",
    onIconClass: "glyphicon glyphicon-lock"
  });

  $('#newProjectPrivate').prop('checked', false);
  projectModalPrivateInfoUpdate($('#newProjectPrivateInfo'), false);

  $('#newProjectModal').on('shown.bs.modal', function() {
    $('input[maxlength]').maxlength({
      alwaysShow: true
    });
    $('textarea[maxlength]').maxlength({
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
    $('textarea[maxlength]').maxlength({
      alwaysShow: true
    });
    setTimeout(function(){ $('#editProjectTitle').focus(); }, 150);

    $('#editProjectPrivate').checkboxpicker({
      offLabel: "Public",
      offIconClass: "glyphicon glyphicon-globe",
      onLabel: "Private",
      onIconClass: "glyphicon glyphicon-lock"
    });
  });
});

Template.projectToolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('#new-project-button').popover();
  }
});

Template.projectButtons.onRendered(function () {
  $('#project-state-' + this.data._id).prop('checked', this.data.active);
  $('#project-state-' + this.data._id).checkboxpicker({
    offLabel: false,
    offIconClass: "glyphicon glyphicon-remove",
    onLabel: false,
    onIconClass: "glyphicon glyphicon-ok"
  });
});
