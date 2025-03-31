require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet()); 

app.use("/api", userRoutes);
// console.log(process.env.PORT);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
