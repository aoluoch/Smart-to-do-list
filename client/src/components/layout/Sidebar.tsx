import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Dependencies',
    href: '/dependencies',
    icon: GitBranch,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarVariants = {
    open: {
      width: isMobile ? '280px' : '280px',
      x: 0,
    },
    closed: {
      width: isMobile ? '280px' : '80px',
      x: isMobile ? '-100%' : 0,
    },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarOpen ? 'open' : 'closed'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "h-screen bg-card border-r border-border shadow-custom-sm flex flex-col fixed left-0 top-0",
        isMobile ? "z-50" : "z-40"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-card-foreground">
                Smart Todo
              </span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-secondary text-primary font-medium shadow-custom-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-card-foreground'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-card-foreground'
                  )} />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground text-center"
          >
            Smart To-Do Scheduler v1.0
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};