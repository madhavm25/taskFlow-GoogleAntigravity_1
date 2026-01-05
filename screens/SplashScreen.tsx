import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-accent flex flex-col items-center justify-center z-[100] transition-colors duration-500">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "backOut" }}
        className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-6"
      >
        <CheckSquare className="w-16 h-16 text-accent transition-colors" strokeWidth={2.5} />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white text-3xl font-bold tracking-tight"
      >
        TaskFlow
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/70 text-sm mt-2 font-medium"
      >
        Your day, beautifully organized.
      </motion.p>
    </div>
  );
};

export default SplashScreen;