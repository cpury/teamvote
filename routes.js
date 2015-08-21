FlowRouter.route('/', {
  action: function() {
    Session.set("ideasLoaded", false);
    BlazeLayout.render('mainLayout', { main: "listIdeas" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Home"
});

FlowRouter.route('/about/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticAbout" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "About Page"
});

FlowRouter.route('/contact/', {
  action: function() {
    BlazeLayout.render('mainLayout', { main: "staticContact" });
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },
  name: "Contact Page"
});
