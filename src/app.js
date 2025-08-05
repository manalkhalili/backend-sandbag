const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();
const Routes = require("./routes"); // This is the correct import for your routes
// Note: You had 'const routes = require("./routes");' which was a duplicate and can be removed if not used elsewhere.
const errorHandler = require("./middlewares/errorHandler"); // Your general error handler

const app = express();


// 1. Apply general middleware
app.use(cors());

// 2. Body parsing middleware (this is where invalid JSON will cause an error)
app.use(express.json());

// 3. JSON parsing error handling middleware
// This should come immediately after express.json() to catch its specific errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON Payload Error:", err.message); // Log the detailed error on the server
    return res.status(400).json({
      success: false,
      message:
        "Invalid JSON payload in the request body. Please ensure your request body is valid JSON.",
      // Optional: uncomment the line below to send the specific parsing error message to the client for debugging
      // error: err.message
    });
  }
  // If it's not a JSON parsing error, pass it to the next error handler
  next(err);
});

// 4. Define your API routes
// Routes should come after all body parsing and its specific error handling
app.use("/", Routes);

// 5. General error handler
// This should be the last middleware in your chain to catch any other errors
// that occur in your routes or other middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

const syncModels = async () => {
  try {
    await db.sequelize.sync();
    console.log("Models synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const init = async () => {
  await connectDB();
  await syncModels(); // Ensure this runs to update your database schema
  startServer();
};

init();
