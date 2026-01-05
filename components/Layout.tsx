import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Settings, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/', label: 'Tasks', icon: Home },
    { id: '/completed', label: 'Done', icon: CheckSquare },
    { id: '/settings', label: 'Settings', icon: Settings },
  ];

  const hideNav = location.pathname.startsWith('/add') || location.pathname.startsWith('/edit');

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* Content Area */}
      <main className="flex-1 pb-24 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      {!hideNav && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/add')}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent-tonal z-50 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-700 h-20 px-4 flex items-center justify-around z-40 transition-colors">
          {navItems.map((item) => {
            const isActive = location.pathname === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className="relative flex flex-col items-center justify-center flex-1 transition-colors group"
              >
                <div className={`
                  relative p-2 rounded-full transition-all duration-300
                  ${isActive ? 'bg-accent-tonal text-accent px-6' : 'text-neutral-500 dark:text-neutral-400'}
                `}>
                  <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs mt-1 font-medium transition-all ${isActive ? 'text-accent opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;