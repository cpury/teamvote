Ideas = new Mongo.Collection("ideas");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    ideas: function () {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.idea.helpers({
    rendered: function () {

    }
  });

  Template.body.events({
    "submit .new-idea": function (event) {
      // This function is called when the new idea form is submitted

      var text = event.target.text.value;

      Ideas.insert({
        text: text,
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
