import React from 'react';
import { motion } from 'framer-motion';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds and customize your workspace to match your workflow.'
    },
    {
      number: '02',
      title: 'Add Your Tasks',
      description: 'Import existing tasks or create new ones with our intuitive interface.'
    },
    {
      number: '03',
      title: 'Stay Organized',
      description: 'Let our AI help you prioritize and schedule tasks for maximum productivity.'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-blue-green bg-clip-text text-transparent">
              Get started in 3 simple steps
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Setting up your productivity workflow has never been easier.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center"
            >
              <motion.div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-8 ${
                  index === 0 ? 'bg-gradient-blue-purple' : 
                  index === 1 ? 'bg-gradient-blue-green' : 
                  'bg-gradient-primary'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                {step.number}
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">{step.title}</h3>
              <p className="text-lg text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
