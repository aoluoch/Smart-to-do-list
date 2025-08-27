import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const GetStartedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Get Started Section */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-blue-purple bg-clip-text text-transparent">
                Ready to boost your productivity?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Join TaskFlow today and experience the difference intelligent task management can make.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-gradient-blue-purple text-white hover:opacity-90 text-xl px-12 py-4"
              >
                Get Started
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-purple-soft border-t border-purple-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-blue-purple rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground hover:bg-gradient-blue-green hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer">
              TaskFlow
            </span>
          </div>
          <p className="text-sm text-muted-foreground hover:bg-gradient-blue-green hover:bg-clip-text hover:text-transparent transition-all duration-300 cursor-pointer">
            © 2025 TaskFlow. All rights reserved. Built for productivity.
          </p>
        </div>
      </footer>
    </div>
  );
};
