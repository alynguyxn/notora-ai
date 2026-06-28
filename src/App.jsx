import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ChatPage from './ChatPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import PageWrapper from './components/PageWrapper';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><ChatPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const navLinks = [
    { name: 'Notora Ai', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <Router>
      <div className="h-screen bg-neutral-base flex flex-col items-center py-10 px-4">
        <header className="sticky top-10 z-50 w-full max-w-xl bg-white/80 backdrop-blur-md border border-neutral-subtle rounded-full py-3 px-8 flex items-center justify-center gap-12 shadow-sm">
          <nav className="flex gap-8 text-lg font-bold text-soft-black">
            {navLinks.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path}
                className="relative px-4 py-1 rounded-full group transition-colors duration-300"
              >
                {({ isActive }) => (
                  <>
                    {/* The purple bubble: visible if active or on hover */}
                    <span className={`absolute inset-0 bg-accent-pop rounded-full transition-opacity duration-300 
                      ${isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'}`}>
                    </span>
                    {/* Text color changes to white when active for better contrast */}
                    <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-soft-black'}`}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </header>

        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;