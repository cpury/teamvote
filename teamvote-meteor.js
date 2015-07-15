Ideas = new Mongo.Collection("ideas");

Meteor.methods({
  addIdea: function(title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Ideas.insert({
      title: title,
      upvoteCount: 1,
      upvotes: [Meteor.userId()],
      description: description,
      author: Meteor.userId(),
      authorName: Meteor.user().username,
      comments: [],
      createdAt: new Date()
    });
  },

  deleteIdea: function(ideaId) {
    idea = Ideas.findOne({_id: ideaId});

    if(!idea) {
      throw new Meteor.Error("not-found");
    }
    if(Meteor.userId() != idea.author) {
      throw new Meteor.Error("not-authorized");
    }

    Ideas.remove(ideaId);
  },

  upvoteIdea: function(ideaId) {
    if(!Meteor.userId()) {
      return;
    }

    idea = Ideas.findOne({_id: ideaId});

    if(idea.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update({_id: ideaId}, {$inc: {upvoteCount: -1}});
      Ideas.update({_id: ideaId}, {$pull : {upvotes: Meteor.userId()}});
    } else {
      // Add vote:
      Ideas.update({_id: ideaId}, {$inc: {upvoteCount: 1}});
      Ideas.update({_id: ideaId}, {$addToSet : {upvotes: Meteor.userId()}});
    }
  },


  addComment: function(ideaId, text) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    var comment = {
      _id: new Meteor.Collection.ObjectID()._str,
      text: text,
      upvoteCount: 1,
      upvotes: [Meteor.userId()],
      author: Meteor.userId(),
      authorName: Meteor.user().username,
      createdAt: new Date()
    };

    Ideas.update({_id: ideaId}, {$push: {comments: comment}});
  },

  deleteComment: function(ideaId, comment) {
    if(Meteor.userId() != comment.author) {
      throw new Meteor.Error("not-authorized");
    }

    Ideas.update({_id: ideaId}, {$pull: {comments: comment}});
  },

  upvoteComment: function(ideaId, comment) {
    if(!Meteor.userId()) {
      return;
    }

    if(comment.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {$inc: {'comments.$.upvoteCount': -1}}
      );
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {$pull : {'comments.$.upvotes': Meteor.userId()}}
      );
    } else {
      // Add vote:
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {$inc: {'comments.$.upvoteCount': 1}}
      );
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {$addToSet : {'comments.$.upvotes': Meteor.userId()}}
      );
    }
  }
});

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
      return idea.upvotes.indexOf(Meteor.userId()) != -1;
    },
    canDeleteIdea: function (idea) {
      return Meteor.userId() == idea.author;
    }
  });

  Template.comment.helpers({
    commentIsUpvoted: function (comment) {
      return comment.upvotes.indexOf(Meteor.userId()) != -1;
    },
    canDeleteComment: function (comment) {
      return Meteor.userId() == comment.author;
    }
  });

  Template.body.events({
    "submit .new-idea": function (event) {
      var title = event.target.title.value;
      var description = event.target.description.value;

      Meteor.call("addIdea", title, description);

      event.target.title.value = "";
      event.target.description.value = "";

      return false;
    },

    "submit .new-comment": function (event) {
      var text = event.target.text.value;

      Meteor.call("addComment", this._id, text);

      event.target.text.value = "";

      return false;
    }
  });

  Template.idea.events({
    "click .delete-idea": function () {
      Meteor.call("deleteIdea", this._id);
    },
    "click .upvote-idea": function () {
      Meteor.call("upvoteIdea", this._id);
    }
  });

  Template.comment.events({
    "click .delete-comment": function () {
      Meteor.call("deleteComment", Template.parentData()._id, this);
    },
    "click .upvote-comment": function () {
      Meteor.call("upvoteComment", Template.parentData()._id, this);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_AND_EMAIL"
  });
}
