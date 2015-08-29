Projects = new Mongo.Collection("projects");

Meteor.methods({
  addProject: function(title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(title, String);
    check(description, String);

    if (!title) {
      return;
    }

    var projectId = Projects.insert({
      title: title,
      description: description,
      authorId: Meteor.userId(),
      authorName: Meteor.user().username,
      members: [Meteor.userId()],
      active: true,
      createdAt: new Date()
    });

    return projectId;
  },

  editProject: function(projectId, title, description) {
    if(!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    check(projectId, String);
    check(title, String);
    check(description, String);

    if (!title) {
      return;
    }

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
  },

  deleteProject: function(projectId) {
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
      return;
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
