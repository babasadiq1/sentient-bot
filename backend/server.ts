import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// Import router from routes - omit extension so TS/tsx can resolve during dev,
// and the compiled output will still work when built to JS.
import chatRouter from "./routes/chat"; // routes/chat.ts

dotenv.config();
console.log("PORT:", process.env.PORT);
console.log("DOBBY_URL:", process.env.DOBBY_API_URL);
console.log("DOBBY_KEY:", process.env.DOBBY_API_KEY );
console.log("DOBBY_MODEL:", process.env.DOBBY_MODEL);


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/chat", chatRouter);

app.get("/", (_req, res) => {
  res.send("✅ Backend running");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});