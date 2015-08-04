Template.listIdeas.onCreated(function () {
  var self = this;
  self.autorun(function () {
    var projectId = FlowRouter.getParam("projectId");
    // TODO: Use projectId later on.
    self.subscribe("ideas");
  });
});

Template.listIdeas.helpers({
  ideas: function () {
    orderByDependency.depend();
    order_by = Session.get("order_by");

    if (order_by == "Newest") {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
    if (order_by == "Oldest") {
      return Ideas.find({}, {sort: {createdAt: +1}});
    }
    if (order_by == "Upvotes") {
      return Ideas.find({}, {sort: {upvoteCount: -1, createdAt: -1}});
    }
    if (order_by == "Comments") {
      return Ideas.find({}, {sort: {commentCount: -1, createdAt: -1}});
    }

    return Ideas.find({});
  }
});

Template.idea.helpers({
  rendered: function () {
  },
  ideaIsUpvoted: function (idea) {
    return idea.upvotes.indexOf(Meteor.userId()) != -1;
  },
  canDeleteIdea: function (idea) {
    return Meteor.userId() == idea.author;
  }
});

Template.orderBy.helpers({
  isSelected: function (value) {
    return Session.equals('order_by', value) ? 'active' : '';
  }
})

Template.newIdea.events({
  "submit .new-idea": function (event) {
    var title = event.target.title.value;
    var description = event.target.description.value;

    Meteor.call("addIdea", title, description);

    event.target.title.value = "";
    event.target.description.value = "";

    $('#newIdeaModal').modal('hide');

    orderByDependency.changed();

    analytics.track("Add idea", {
      title: this.title
    });

    return false;
  }
});

Template.idea.events({
  "click .delete-idea": function () {
    Meteor.call("deleteIdea", this._id);
    analytics.track("Delete idea", {
      _id: this._id,
      title: this.title
    });
  },
  "click .upvote-idea": function () {
    Meteor.call("upvoteIdea", this._id);
    orderByDependency.changed();
    analytics.track("Toggle upvote idea", {
      _id: this._id,
      title: this.title
    });
  }
});

Template.orderBy.events({
  "change .orderByButton": function (event) {
    var order_by = event.target.id;

    Session.set("order_by", order_by);
    orderByDependency.changed();

    analytics.track("Changed ordering", {
      newOrdering: order_by
    });
  }
});

Template.newIdea.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
  $('#newIdeaModal').on('shown.bs.modal', function() {
    $('#newIdeaTitle').focus();
  });
});

Template.toolbar.onRendered(function() {
  if (!Meteor.userId()) {
    $('[data-toggle="popover"]').popover();
  }
});
