// src/components/PageWrapper.jsx
import { motion } from 'framer-motion';

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Starts slightly faded and below
      animate={{ opacity: 1, y: 0 }}  // Slides up and fades in
      exit={{ opacity: 0, y: -10 }}   // Slides up and fades out
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full flex-grow"
    >
      {children}
    </motion.div>
  );
}