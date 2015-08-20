Template.registerHelper("userOwnsIdea", function (idea) {
    return Meteor.userId() == idea.author;
});

Template.registerHelper("userOwnsComment", function (comment) {
    return Meteor.userId() == comment.author;
});