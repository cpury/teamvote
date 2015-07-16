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
    idea = Ideas.findOne(ideaId);

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

    idea = Ideas.findOne(ideaId);

    if(idea.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update(ideaId, {$inc: {upvoteCount: -1}});
      Ideas.update(ideaId, {$pull : {upvotes: Meteor.userId()}});
    } else {
      // Add vote:
      Ideas.update(ideaId, {$inc: {upvoteCount: 1}});
      Ideas.update(ideaId, {$addToSet : {upvotes: Meteor.userId()}});
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

    Ideas.update(ideaId, {$push: {comments: comment}});
  },

  deleteComment: function(ideaId, comment) {
    if(Meteor.userId() != comment.author) {
      throw new Meteor.Error("not-authorized");
    }

    Ideas.update(ideaId, {$pull: {comments: comment}});
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
