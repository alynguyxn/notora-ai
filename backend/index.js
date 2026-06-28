import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import { extractText, getDocumentProxy } from 'unpdf';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  // This automatically retries requests that return 503 errors
  requestOptions: {
    timeout: 30000, // 30 seconds
  },
});
console.log("DEBUG: API Key length is", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "UNDEFINED");
console.log("API Key found in process.env:", process.env.GEMINI_API_KEY ? "YES" : "NO");
// Add this temporarily at the very top of your index.js, right after initializing genAI
try {
    const testModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("SUCCESS: Initialized model successfully");
} catch (e) {
    console.error("CRITICAL ERROR: Failed to initialize model:", e.message);
}

// PDF Extraction Logic
async function extractTextFromPDF(buffer) {
    try {
        const uint8Array = new Uint8Array(buffer);
        const pdf = await getDocumentProxy(uint8Array);
        const { text } = await extractText(pdf, { mergePages: true });

        if (!text || text.trim().length === 0) {
            throw new Error("No text content found in PDF.");
        }
        return text;
    } catch (err) {
        console.error("Unpdf Error:", err);
        throw err;
    }
}

// Retry mechanism
async function generateResponseWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (error.status === 503 && i < retries - 1) {
        // Wait 2 seconds before retrying if it's a 503 error
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error; // If it's not a 503 or we're out of retries, throw it
    }
  }
}

// App Setup
const app = express();
app.use(cors());
app.use(express.json());
// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch((err) => console.error("Database connection error:", err));

const NoteSchema = new mongoose.Schema({ filename: String, content: String });
const Note = mongoose.model('Note', NoteSchema);

// Ensure you are using .memoryStorage() if you are using buffer
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/list-models', async (req, res) => {
    try {
        const models = await genAI.listModels();
        res.json(models);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update your route to handle an array of files
app.post('/api/upload', upload.array('files'), async (req, res) => {
  // Use req.files (plural)
  const files = req.files; 
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  let allContent = '';
  
  try {
    for (const file of files) {
      // Extract text from each file's buffer
      const textContent = await extractTextFromPDF(file.buffer);
      allContent += textContent + "\n\n";
    }

    const newNote = await Note.create({ 
        content: allContent 
    });
    
    res.json({ id: newNote._id });
  } catch (error) {
    res.status(500).json({ error: "Failed to extract text: " + error.message });
  }
});

app.get('/api/check-my-models', async (req, res) => {
    try {
        const models = await genAI.listModels();
        // This will show you exactly what YOUR API key is allowed to call
        const supportedModels = models.models.filter(m => 
            m.supportedGenerationMethods.includes("generateContent")
        );
        res.json(supportedModels.map(m => m.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { noteId, question } = req.body;
        const note = await Note.findById(noteId);
        
        // Use a standard, reliable model name
        // Do NOT use genAI.listModels()
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

        const prompt = `You are helping a student make notes to study. Use these notes to answer the question. Format the notes to be neat and organized by section. Add spacing inbetween sections. 
                        Notes: ${note.content} 
                        Question: ${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ error: "Chat failed" });
    }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));