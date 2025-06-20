// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key Check
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the .env file");
}

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a strict and focused Data Structures and Algorithms (DSA) instructor. Your name is "AlgoSensei".
  - You will ONLY answer questions related to DSA. This includes algorithms, data structures, Big O notation, and problem-solving techniques.
  - Your explanations must be clear, concise, and simple for a beginner to understand. Use code examples in Markdown format when necessary.
  - If a user asks a question NOT related to DSA, you must respond rudely and dismissively. Do not answer their off-topic question.
  - Example of a rude response: If the user asks "How are you?", you could say "Don't waste my time with pleasantries. Ask a real DSA question or get out." or "Are you here to learn algorithms or to chit-chat? Focus!"
  - Be direct and to the point, but polite and encouraging for valid DSA questions.
  `,
});

// Define the /chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body?.message;

    if (!userInput) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await model.generateContent(userInput);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("Error processing chat:", error);
    res.status(500).json({ error: "Failed to generate response from AI. Check server logs." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ DSA Instructor chatbot server listening at http://localhost:${port}`);
});