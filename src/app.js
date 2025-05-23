const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();
const Routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.use("/", Routes);

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
  await syncModels();
  startServer();
};
init();
