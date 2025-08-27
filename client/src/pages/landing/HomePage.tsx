import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
        >
          Master Your Tasks,
          <span className="bg-gradient-blue-purple bg-clip-text text-transparent"> Achieve More</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
        >
          Transform your productivity with TaskFlow - the intelligent task management system 
          that adapts to your workflow and helps you achieve your goals faster.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-gradient-blue-purple text-white hover:opacity-90 text-lg px-8 py-3"
          >
            Sign Up
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/login')}
            className="text-lg px-8 py-3 border-2 bg-gradient-blue-green bg-clip-text text-transparent border-gradient-blue-green hover:bg-gradient-blue-green hover:text-white transition-all duration-300"
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
