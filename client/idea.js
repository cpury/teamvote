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
    return Session.equals('order_by', value) ? 'selected' : '';
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

    return false;
  }
});

Template.idea.events({
  "click .delete-idea": function () {
    Meteor.call("deleteIdea", this._id);
  },
  "click .upvote-idea": function () {
    Meteor.call("upvoteIdea", this._id);
    orderByDependency.changed();
  }
});

Template.orderBy.events({
  "change #order-by-form": function (event) {
    var order_by = event.target.value;

    Session.set("order_by", order_by);
    orderByDependency.changed();
  }
});

Template.newIdea.onRendered(function() {
  $('input[maxlength]').maxlength({
    alwaysShow: true
  });
});
