FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "listIdeas" });
  }
});

FlowRouter.route('/about/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
  }
});

FlowRouter.route('/contact/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticContact" });
  }
});
