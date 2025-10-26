import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      process.env.DOBBY_API_URL,
      {
        model: process.env.DOBBY_MODEL,
        input: userMessage,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DOBBY_API_KEY}`,
        },
      }
    );

    res.json({
      reply: response.data.output || "⚠️ No response from Dobby.",
    });
  } catch (error) {
    console.error("Error from Dobby:", error.message);
    res.status(500).json({ error: "⚠️ Error connecting to Dobby API." });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend running on port ${process.env.PORT}`);
});
