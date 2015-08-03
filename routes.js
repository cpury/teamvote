FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "listIdeas" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
});

FlowRouter.route('/about/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
});

FlowRouter.route('/contact/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticContact" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
});
