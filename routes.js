FlowRouter.route('/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "listProjects" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "List Projects"
});

FlowRouter.route('/about/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "About Page"
});

FlowRouter.route('/contact/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "staticContact" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Contact Page"
});

FlowRouter.route('/:projectId/', {
  action: function(params, queryParams) {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    Session.set("currentProject", params.projectId);
    BlazeLayout.render('mainLayout', { main: "listIdeas" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Project detail"
});
