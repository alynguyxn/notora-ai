import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const [file, setFile] = useState(null);
  const [noteId, setNoteId] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentView, setCurrentView] = useState('landing');

  const TypedTitle = () => {
    const fullText = "Notora Ai";
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
    }, []);

    return (
      <h1 className="text-8xl font-bold mb-2 text-soft-black tracking-tight flex items-center">
        {displayedText}
        <span className="w-2 h-24 bg-accent-pop ml-2 animate-blink"></span>
      </h1>
    );
  };

  const handleChat = async (e) => {
    e.preventDefault(); // Prevent page refresh
    if (!question.trim()) return;

    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = question;
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('https://notora-ai.onrender.com/api/chat', { 
        noteId: noteId, 
        question: currentQuestion 
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (event) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files)]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return alert("No files selected!");
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    try {
      const res = await axios.post('https://notora-ai.onrender.com/api/upload', formData);
      setNoteId(res.data.id);
      setIsUploaded(true);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="flex flex-col flex-grow w-full items-center">
      <AnimatePresence mode="wait">
        {!isUploaded ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center mt-50 flex-grow w-full px-4"
          >
            <div className="text-center">
              <TypedTitle />
              <p className="text-lg text-soft-black font-medium mt-0 mb-10 opacity-70">Ready to start studying?</p>
            </div>
            
            <div className="flex flex-row items-center gap-4 bg-white p-4 rounded-full shadow-sm border border-slate-200 w-full max-w-lg">
              <div className="w-full bg-white/80 p-2 rounded-full border border-neutral-subtle">
                <input type="file" multiple onChange={handleFileSelection} className="text-xs w-full" />
              </div>
              <button onClick={uploadFiles} className="bg-accent-pop text-white px-5 py-2 rounded-full font-semibold hover:opacity-70 transition-opacity whitespace-nowrap">
                Upload Files
              </button>
            </div>

            <ul className="mt-6 w-full max-w-sm">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 px-4 mb-2 border rounded-full shadow-sm text-sm">
                  <span className="truncate">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="text-red-400 font-bold ml-4">✕</button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-neutral-base w-full max-w-2xl flex flex-col flex-grow relative"
          >
            <div className="w-full flex-grow overflow-y-auto pt-32 pb-32 px-4 no-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-6 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-3xl shadow-sm border border-neutral-subtle max-w-[80%] ${msg.role === 'user' ? 'bg-accent-pop text-white' : 'bg-white text-gray-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <p className="italic text-gray-500 ml-4 animate-pulse">Thinking...</p>}
            </div>

            <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4">
              <form onSubmit={handleChat} className="flex items-center gap-3 w-full max-w-2xl bg-white p-2 rounded-full border border-neutral-subtle shadow-sm">
                <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." className="flex-grow bg-transparent px-4 py-2 outline-none" />
                <button type="submit" disabled={loading} className="bg-accent-pop text-white px-6 py-2 rounded-full font-bold">
                  {loading ? "Sending..." : "Ask"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        {/* Footer Icon at the bottom */}
        <footer className={`mt-auto py-10 ${isUploaded ? 'hidden' : 'block'}`}>
          <a 
            href="https://github.com/alynguyxn/notora-ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-colors duration-300 text-gray-400 hover:text-accent-pop"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </footer>
    </div>
  );
}