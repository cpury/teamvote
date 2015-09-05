Session.setDefault("orderBy", "Newest");
orderByDependency = new Tracker.Dependency;

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL",
  forceEmailLowercase: true
});

Session.set("ideasLoaded", false);

Meteor.startup(function () {
  $(document).click(function (event) {
    if (!$('.navbar-toggle').is(':visible') || !$('.navbar-collapse').hasClass('in')) {
      return;
    }

    if (!$(event.target).hasClass("navbar-toggle")) {
      $("button.navbar-toggle").click();
    }
  });
});
