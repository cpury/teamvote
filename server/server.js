Meteor.startup(function () {
  Ideas._ensureIndex({"authorId": 1});
  Ideas._ensureIndex({"upvotes": 1});
  Ideas._ensureIndex({"comments.authorId": 1});
  Ideas._ensureIndex({"comments.upvotes": 1});

  Projects._ensureIndex({"authorId": 1});
});

Meteor.publish("projects", function () {
  return Projects.find({});
});

Meteor.publish("ideas", function (projectId) {
  return Ideas.find({"projectId": projectId});
});

Meteor.publish("onlineUsers", function () {
  return Meteor.users.find({ "status.online": true }, { "username": 1 });
});
