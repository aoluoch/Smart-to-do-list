import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '@/hooks/useApp';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMarginLeft = () => {
    if (isMobile) return '0px';
    return sidebarOpen ? '280px' : '80px';
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area with responsive sidebar offset */}
      <div
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: getMarginLeft()
        }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>

        {/* Scrollable Content with responsive padding */}
        <motion.main
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
