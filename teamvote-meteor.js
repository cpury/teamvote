Ideas = new Mongo.Collection("ideas");

Meteor.methods({
  addIdea: function(title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(title, String);
    check(description, String);

    Ideas.insert({
      title: title,
      upvoteCount: 1,
      upvotes: [Meteor.userId()],
      description: description,
      author: Meteor.userId(),
      authorName: Meteor.user().username,
      commentCount: 0,
      comments: [],
      createdAt: new Date()
    });
  },

  deleteIdea: function(ideaId) {
    check(ideaId, String);

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
    check(ideaId, String);

    idea = Ideas.findOne(ideaId);

    if(idea.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update(
        ideaId,
        {
          $inc: {upvoteCount: -1},
          $pull : {upvotes: Meteor.userId()}
        }
      );
    } else {
      // Add vote:
      Ideas.update(
        ideaId,
        {
          $inc: {upvoteCount: 1},
          $addToSet : {upvotes: Meteor.userId()}
        }
      );
    }
  },


  addComment: function(ideaId, text) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(ideaId, String);
    check(text, String);

    var comment = {
      _id: new Meteor.Collection.ObjectID()._str,
      text: text,
      upvoteCount: 1,
      upvotes: [Meteor.userId()],
      author: Meteor.userId(),
      authorName: Meteor.user().username,
      createdAt: new Date()
    };

    Ideas.update(
      ideaId,
      {
        $inc: {commentCount: 1},
        $push: {comments: comment}
      }
    );
  },

  deleteComment: function(ideaId, comment) {
    if(Meteor.userId() != comment.author) {
      throw new Meteor.Error("not-authorized");
    }
    check(ideaId, String);
    // TODO check comment... need to replace with commentId

    Ideas.update(
      ideaId,
      {
        $inc: {commentCount: -1},
        $pull: {comments: comment}
      }
    );
  },

  upvoteComment: function(ideaId, comment) {
    if(!Meteor.userId()) {
      return;
    }
    check(ideaId, String);
    // TODO check comment... need to replace with commentId

    if(comment.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {
          $inc: {'comments.$.upvoteCount': -1},
          $pull : {'comments.$.upvotes': Meteor.userId()}
        }
      );
    } else {
      // Add vote:
      Ideas.update(
        {_id: ideaId, 'comments._id': comment._id},
        {
          $inc: {'comments.$.upvoteCount': 1},
          $addToSet : {'comments.$.upvotes': Meteor.userId()}
        }
      );
    }
  }
});
