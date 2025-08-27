import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Smartphone } from 'lucide-react';

export const BenefitsPage: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      title: 'Boost Productivity',
      description: 'Increase your efficiency by up to 40% with our smart task prioritization.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with enterprise-grade security.'
    },
    {
      icon: Smartphone,
      title: 'Cross-Platform',
      description: 'Access your tasks anywhere with our responsive web application.'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-purple-50 py-16">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-blue-purple bg-clip-text text-transparent">
              Why choose TaskFlow?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their productivity.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="text-center"
            >
              <motion.div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${
                  index === 0 ? 'bg-gradient-blue-purple' :
                  index === 1 ? 'bg-gradient-purple-soft' :
                  'bg-gradient-primary'
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <benefit.icon className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">{benefit.title}</h3>
              <p className="text-lg text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
