Meteor.publish("ideas", function () {
  return Ideas.find({}, {sort: {createdAt: -1}});
});
