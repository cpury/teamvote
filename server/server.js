Meteor.startup(function () {
  Ideas._ensureIndex({"author": 1});
  Ideas._ensureIndex({"upvotes": 1});
  Ideas._ensureIndex({"comments.author": 1});
  Ideas._ensureIndex({"comments.upvotes": 1});
});

Meteor.publish("ideas", function () {
  return Ideas.find({});
});

Meteor.publish("onlineUsers", function() {
  return Meteor.users.find({ "status.online": true }, { "username": 1 });
});
