Ideas = new Mongo.Collection("ideas");

if (Meteor.isClient) {
  Template.registerHelper("formatDate", function (date) {
    return moment(date).fromNow();
  });

  Template.body.helpers({
    ideas: function () {
      return Ideas.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.idea.helpers({
    rendered: function () {
    },
    ideaIsUpvoted: function (idea) {
      return this.upvotes.indexOf(Meteor.userId()) != -1;
    }
  });

  Template.body.events({
    "submit .new-idea": function (event) {
      var title = event.target.title.value;
      var description = event.target.description.value;

      Ideas.insert({
        title: title,
        upvoteCount: 1,
        description: description,
        author: Meteor.userId(),
        authorName: Meteor.user().username,
        comments: [],
        upvotes: [Meteor.userId()],
        createdAt: new Date()
      });

      Meteor.user().profile.update({ _id: this._id }, { $push: { comments: comment }})

      event.target.text.value = "";
      event.target.description.value = "";

      return false;
    },

    "submit .new-comment": function (event) {
      var text = event.target.text.value;

      var comment = {
        text: text,
        upvoteCount: 1,
        author: Meteor.userId(),
        authorName: Meteor.user().username,
        createdAt: new Date()
      }

      Ideas.update({ _id: this._id }, { $push: { comments: comment }})

      event.target.text.value = "";

      return false;
    }
  });

  Template.idea.events({
    "click .delete": function () {
      Ideas.remove(this._id);
    },
    "click .upvote": function () {
      if(this.upvotes.indexOf(Meteor.userId()) != -1) {
        // Remove vote:
        Ideas.update({_id: this._id}, {$inc: {upvoteCount: -1}});
        Ideas.update({_id: this._id}, {$pull : {upvotes: Meteor.userId()}});
      } else {
        // Add vote:
        Ideas.update({_id: this._id}, {$inc: {upvoteCount: 1}});
        Ideas.update({_id: this._id}, {$addToSet : {upvotes: Meteor.userId()}});
      }
    }
  });

  Template.comment.events({
    "click .delete": function () {
      console.log("WHUT!");
      console.log(this);
      Ideas.update({_id: this._id}, {$pull : {comments : this}});
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });
}
