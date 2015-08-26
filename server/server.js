Meteor.startup(function () {
  Ideas._ensureIndex({"authorId": 1});
  Ideas._ensureIndex({"upvotes": 1});
  Ideas._ensureIndex({"comments.authorId": 1});
  Ideas._ensureIndex({"comments.upvotes": 1});
});

Meteor.publish("ideas", function () {
  return Ideas.find({});
});

Meteor.publish("onlineUsers", function() {
  return Meteor.users.find({ "status.online": true }, { "username": 1 });
});
