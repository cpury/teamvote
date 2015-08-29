var prepareRoute = function() {
  $('.modal-backdrop').remove();
  Session.set("ideasLoaded", false);
  Session.set("projectsLoaded", false);
};

FlowRouter.route('/', {
  action: function() {
    prepareRoute();
    BlazeLayout.render('mainLayout', { main: "listProjects" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "List projects"
});

FlowRouter.route('/how-it-works/', {
  action: function() {
    prepareRoute();
    BlazeLayout.render('mainLayout', { main: "staticHowItWorks" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "How it works page"
});

FlowRouter.route('/about/', {
  action: function() {
    prepareRoute();
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "About page"
});

FlowRouter.route('/contact/', {
  action: function() {
    prepareRoute();
    BlazeLayout.render('mainLayout', { main: "staticContact" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Contact page"
});

FlowRouter.route('/:projectId/', {
  action: function(params, queryParams) {
    prepareRoute();
    Session.set("currentProject", params.projectId);
    BlazeLayout.render('mainLayout', { main: "listIdeas" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Project detail"
});
