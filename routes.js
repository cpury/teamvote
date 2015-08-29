FlowRouter.route('/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "listProjects" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "List projects"
});

FlowRouter.route('/how-it-works/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "staticHowItWorks" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "How it works page"
});

FlowRouter.route('/about/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "About page"
});

FlowRouter.route('/contact/', {
  action: function() {
    Session.set("ideasLoaded", false);
    Session.set("projectsLoaded", false);
    BlazeLayout.render('mainLayout', { main: "staticContact" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Contact page"
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
