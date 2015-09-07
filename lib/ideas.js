Ideas = new Mongo.Collection("ideas");

var IDEA_TITLE_MAX_LEN = 100;
var IDEA_DESCRIPTION_MAX_LEN = 200;

Meteor.methods({
  addIdea: function(projectId, title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(title, String);
    check(description, String);

    if (!title || !projectId) {
      throw new Meteor.Eror("incomplete");
    }

    title = title.trim().substring(0, IDEA_TITLE_MAX_LEN);
    description = description.trim().substring(0, IDEA_DESCRIPTION_MAX_LEN);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    try {
      var ideaId = Ideas.insert({
        projectId: projectId,
        title: title,
        upvoteCount: 1,
        upvotes: [Meteor.userId()],
        description: description,
        authorId: Meteor.userId(),
        authorName: Meteor.user().username,
        commentCount: 0,
        comments: [],
        createdAt: new Date()
      });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Meteor.Error("duplicate-key", "An idea with this title exists already");
      }

      throw new Meteor.Error("mongo-error", err);
    }

    return ideaId;
  },

  editIdea: function(projectId, ideaId, title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);
    check(title, String);
    check(description, String);

    if (!title) {
      throw new Meteor.Eror("incomplete");
    }

    title = title.trim().substring(0, IDEA_TITLE_MAX_LEN);
    description = description.trim().substring(0, IDEA_DESCRIPTION_MAX_LEN);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    try {
      Ideas.update(
        {
          "_id": ideaId,
          "projectId": projectId,
          "authorId": Meteor.userId()
        },
        {
          $set: {
            "title": title,
            "description": description
          }
        }
      );
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Meteor.Error("duplicate-key", "An idea with this title exists already");
      }

      throw new Meteor.Error("mongo-error", err);
    }
  },

  deleteIdea: function(projectId, ideaId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    Ideas.remove({
      "_id": ideaId,
      "projectId": projectId,
      "authorId": Meteor.userId()
    });
  },

  upvoteIdea: function(projectId, ideaId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    idea = Ideas.findOne({"_id": ideaId, "projectId": projectId});
    if (!idea) {
      throw new Meteor.Error("unkown-idea");
    }

    if(idea.upvotes.indexOf(Meteor.userId()) != -1) {
      // Remove vote:
      Ideas.update(
        {
          "_id": ideaId,
          "projectId": projectId
        },
        {
          $inc: {upvoteCount: -1},
          $pull : {upvotes: Meteor.userId()}
        }
      );
    } else {
      // Add vote:
      Ideas.update(
        {
          "_id": ideaId,
          "projectId": projectId
        },
        {
          $inc: {upvoteCount: 1},
          $addToSet : {upvotes: Meteor.userId()}
        }
      );
    }
  },


  addComment: function(projectId, ideaId, text) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);
    check(text, String);

    if (!ideaId || !text) {
      throw new Meteor.Eror("incomplete");
    }

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    var commentId = new Meteor.Collection.ObjectID()._str;

    var comment = {
      _id: commentId,
      text: text,
      upvoteCount: 1,
      upvotes: [Meteor.userId()],
      authorId: Meteor.userId(),
      authorName: Meteor.user().username,
      createdAt: new Date()
    };

    Ideas.update(
      {
        "_id": ideaId,
        "projectId": projectId
      },
      {
        $inc: {commentCount: 1},
        $push: {comments: { $each: [comment], $position: 0 }}
      }
    );

    return commentId;
  },

  deleteComment: function(projectId, ideaId, commentId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);
    check(commentId, String);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    Ideas.update(
      {
        "_id": ideaId,
        "projectId": projectId,
        "comments._id": commentId,
        "comments.authorId": Meteor.userId()
      },
      {
        $inc: {commentCount: -1},
        $pull: {comments: {"_id": commentId}}
      }
    );
  },

  upvoteComment: function(projectId, ideaId, commentId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(ideaId, String);
    check(commentId, String);

    project = Projects.findOne(projectId);
    if (!project) {
      throw new Meteor.Error("unkown-project");
    }
    if (!project.active) {
      throw new Meteor.Error("project-closed");
    }

    // Is upvote or not?
    idea = Ideas.findOne(
      {
        "_id": ideaId,
        "projectId": projectId,
        "comments": {
          $elemMatch: {
            "_id": commentId,
            "upvotes": Meteor.userId()
          }
        }
      }
    );

    if(idea) {
      // Remove vote:
      Ideas.update(
        {
          _id: ideaId,
          "projectId": projectId,
          'comments._id': commentId
        },
        {
          $inc: {'comments.$.upvoteCount': -1},
          $pull : {'comments.$.upvotes': Meteor.userId()}
        }
      );
    } else {
      // Add vote:
      Ideas.update(
        {
          _id: ideaId,
          "projectId": projectId,
          'comments._id': commentId
        },
        {
          $inc: {'comments.$.upvoteCount': 1},
          $addToSet : {'comments.$.upvotes': Meteor.userId()}
        }
      );
    }
  }
});
