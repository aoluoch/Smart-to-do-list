import React from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '@/hooks/useApp';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useApp();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area with sidebar offset */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarOpen ? '280px' : '80px' 
        }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <Header />
        </div>
        
        {/* Scrollable Content */}
        <motion.main 
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};