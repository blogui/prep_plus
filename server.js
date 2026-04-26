const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Initialize dotenv
dotenv.config();

// Connect to Redis (optional)
require("./src/config/redisClient");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test-series-be";

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Swagger Config
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Test Series API",
            version: "1.0.0",
            description: "API for Test Series Application",
            contact: {
                name: "Developer",
            },
            servers: [
                {
                    url: "http://localhost:5000",
                },
            ],
        },
    },
    apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api", require("./src/routes/health"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/categories", require("./src/routes/categories"));
app.use("/api/courses", require("./src/routes/courses"));
app.use("/api/questions", require("./src/routes/question"));
app.use("/api/progress", require("./src/routes/userTestProgress"));
app.use("/api/payment", require("./src/routes/payment"));
app.use("/api/support", require("./src/routes/support"));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
