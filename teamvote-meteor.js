Ideas = new Mongo.Collection("ideas");

if (Meteor.isClient) {
  Template.body.helpers({
    ideas: function () {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.idea.helpers({
    rendered: function () {

    },
    formatDate: function (date) {
      return moment(date).format("MM/DD/YYYY");
    }
  });

  Template.body.events({
    "submit .new-idea": function (event) {
      // This function is called when the new idea form is submitted

      var title = event.target.title.value;
      var description = event.target.description.value;

      Ideas.insert({
        title: title,
        upvoteCount: 1,
        description: description,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });

  Template.idea.events({
    "click .delete": function () {
      Ideas.remove(this._id);
    }
  });
}
