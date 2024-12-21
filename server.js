//code
const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import the UUID library
require('dotenv').config();  // For environment variables management
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use(express.static("public")); // To serve static files like HTML, CSS, etc.

// MongoDB Connection using environment variable
const mongoURI = process.env.MONGO_URI || "mongodb+srv://pragatizagade88:P1ragati@cluster0.lyv5f.mongodb.net/AIBlog?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
    process.exit(1); // Exit the app if the database connection fails
  });

// Define Mongoose schema and model
const blogSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() }, // Use UUID as the MongoDB document ID
    title: { type: String, required: true, minlength: 3, maxlength: 100 }, // Add validation for title length
    content: { type: String, required: true, minlength: 10 }, // Add validation for content length
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

const Blog = mongoose.model("Blog", blogSchema);

// Routes

// Create a new blog
app.post("/blogs", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const newBlog = new Blog({ title, content });
    await newBlog.save(); // Save to MongoDB
    res.status(201).json(newBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Error creating blog", error });
  }
});

// Update an existing blog
app.put("/blogs/:id", async (req, res) => {
  const blogId = req.params.id;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content },
      { new: true } // Return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Error updating blog", error });
  }
});

// Fetch all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch all blogs from MongoDB
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs", error });
  }
});

// Fetch a single blog by ID
app.get("/blogs/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Error fetching blog", error });
  }
});

// Delete a blog by ID
app.delete("/blogs/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(204).end(); // No content
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Error deleting blog", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});