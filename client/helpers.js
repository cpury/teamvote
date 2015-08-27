Template.registerHelper("userOwnsProject", function (project) {
  return Meteor.userId() == project.authorId;
});

Template.registerHelper("userOwnsIdea", function (idea) {
  return Meteor.userId() == idea.authorId;
});

Template.registerHelper("userOwnsComment", function (comment) {
  return Meteor.userId() == comment.authorId;
});
