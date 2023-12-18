const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');

// Enable CORS for all requests
app.use(cors());

dotenv.config();

// Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Define the Task Schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false }, // New field
});

// Create the Task model
const Task = mongoose.model("Task", taskSchema);

// Middlewares
app.use(bodyParser.json());
app.use(express.static(__dirname));

// API Endpoints
// Endpoint to get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Endpoint to update a task's completion status
app.patch("/api/tasks/:title", async (req, res) => {
  try {
    const { completed } = req.body;
    const result = await Task.findOneAndUpdate(
      { title: req.params.title },
      { completed },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).send(err);
  }
});

//deleteAll from database
app.delete("/api/tasks/deleteAll", async (req, res) => {
  try {
    // Assuming 'Task' is your MongoDB model
    const result = await Task.deleteMany({}); // Deletes all documents in the collection
    if (result.deletedCount === 0) {
      return res.status(404).send("No tasks found to delete.");
    }
    res.status(200).json({ message: "All tasks deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Endpoint to delete a task
app.delete("/api/tasks/:title", async (req, res) => {
  try {
    console.log(req.params.title);
    const result = await Task.deleteOne({ title: req.params.title });
    if (result.deletedCount === 0) {
      return res.status(404).send("No task found with that title");
    }
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
