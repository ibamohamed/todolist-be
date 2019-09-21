var express = require("express");
var bodyParser = require("body-parser");
var graphqlHttp = require("express-graphql");
var { buildSchema } = require("graphql");
var mongoose = require("mongoose");
var cors = require('cors');
var Task = require("./models/task");
const app = express();
// app.use(bodyParser.json());

app.use(
  "/graphql",
  cors(),
  // bodyParser.json(),
  graphqlHttp({
    schema: buildSchema(`
    type Task {
      _id: ID!
      title: String!
      description: String!
      date_created: String!
      status: Boolean!
    }
  
    type RootQuery {
      tasks: [Task!]!
    }

    input InputTask {
        title: String!
        description: String!
        date_created: String!
        status: Boolean! 
    }
      
     type RootMutation { 
      addTask(inputTask: InputTask): Task
      editTask(id: ID, inputTask: InputTask): Task
      removeTask(id:ID): Boolean
      markNote(id:ID, done:Boolean): Task
    }
  
    schema {
        query: RootQuery
        mutation: RootMutation
    }
  `),
    rootValue: {
      tasks: () => {
        return Task.find({})
          .then(tasks => {
            return tasks.map(task => {
              return { ...task._doc, _id: task.id };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      addTask: args => {
        var task = new Task({
          title: args.inputTask.title,
          description: args.inputTask.description,
          date_created: args.inputTask.date_created,
          status: args.inputTask.status
        });
        return task
          .save()
          .then(result => {
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch(err => {
            throw err;
          });
      },
      editTask: args => {
        return Task.findByIdAndUpdate(args.id, {
          title: args.inputTask.title,
          description: args.inputTask.description,
          date_created: args.inputTask.date_created,
          status: args.inputTask.status
        },
        { new: true })
          .then(result => {
            return Task.findById(args.id);
          })
          .catch(err => {
            throw err;
          });
      },
      removeTask: args => {
        return Task.findByIdAndDelete(args.id)
          .then(result => {
            return true;
          })
          .catch(err => {
            return false;
          });
      },
      markNote: args => {
        return Task.findByIdAndUpdate(args.id, {
          status: args.done
        })
          .then(result => {
            return Task.findById(args.id);
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(process.env.MONGO_URL + process.env.DB_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("---------------Connected---------------");
    app.listen(3000);
  })
  .catch(err => console.log(err));
