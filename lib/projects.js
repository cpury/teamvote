Projects = new Mongo.Collection("projects");

var PROJECT_TITLE_MAX_LEN = 100;
var PROJECT_DESCRIPTION_MAX_LEN = 200;

Meteor.methods({
  addProject: function(title, description, private) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(title, String);
    check(description, String);
    check(private, Boolean)

    if (!title) {
      throw new Meteor.Eror("incomplete");
    }

    title = title.trim().substring(0, PROJECT_TITLE_MAX_LEN);
    description = description.trim().substring(0, PROJECT_DESCRIPTION_MAX_LEN);

    try {
      var projectId = Projects.insert({
        title: title,
        description: description,
        authorId: Meteor.userId(),
        authorName: Meteor.user().username,
        members: [Meteor.userId()],
        private: private,
        active: true,
        createdAt: new Date()
      });
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new Meteor.Error("duplicate-key", "A project with this title exists already");
      }

      throw new Meteor.Error("mongo-error", err);
    }

    return projectId;
  },

  setActiveProject: function(projectId, active) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(active, Boolean);

    if (!projectId) {
      throw new Meteor.Eror("incomplete");
    }

    Projects.update(
      {
        "_id": projectId,
        "authorId": Meteor.userId()
      },
      {
        $set: {
          "active": active
        }
      }
    );
  },

  editProject: function(projectId, title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(title, String);
    check(description, String);

    if (!title || !projectId) {
      throw new Meteor.Eror("incomplete");
    }

    title = title.trim().substring(0, PROJECT_TITLE_MAX_LEN);
    description = description.trim().substring(0, PROJECT_DESCRIPTION_MAX_LEN);

    try {
      Projects.update(
        {
          "_id": projectId,
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
        throw new Meteor.Error("duplicate-key", "A project with this title exists already");
      }

      throw new Meteor.Error("mongo-error", err);
    }
  },

  deleteProject: function(projectId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);

    Projects.remove({
      "_id": projectId,
      "authorId": Meteor.userId()
    });
  },

  addMemberToProject: function(projectId, userId) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(userId, String);

    if (!projectId || !userId) {
      throw new Meteor.Eror("incomplete");
    }

    Projects.update(
      {
        "_id": projectId
      },
      {
        $push: {members: userId}
      }
    );
  }
});
