Meteor.startup(function () {
  Ideas._ensureIndex({"authorId": 1});
  Ideas._ensureIndex({"upvotes": 1});
  Ideas._ensureIndex({"comments.authorId": 1});
  Ideas._ensureIndex({"comments.upvotes": 1});
  Ideas._ensureIndex({"title": 1, "projectId": 1}, {unique: true});

  Projects._ensureIndex({"authorId": 1});
  Projects._ensureIndex({"title": 1}, {unique: true});
});

Meteor.publish("projects", function () {
  return Projects.find({});
});

Meteor.publish("currentProject", function (projectId) {
  return Projects.find(projectId);
});

Meteor.publish("ideas", function (projectId) {
  return Ideas.find({"projectId": projectId});
});

Meteor.publish("onlineUsers", function () {
  return Meteor.users.find({ "status.online": true }, { "username": 1 });
});
