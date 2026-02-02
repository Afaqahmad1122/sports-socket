import express from "express";
import matchesRoutes from "./routes/matches.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// routes
app.use("/matches", matchesRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
