import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, BarChart3, Users, Bell, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: CheckCircle,
      title: 'Smart Task Management',
      description: 'Organize, prioritize, and track your tasks with our intelligent system that adapts to your workflow.'
    },
    {
      icon: Calendar,
      title: 'Advanced Scheduling',
      description: 'Built-in calendar integration with smart scheduling suggestions to optimize your productivity.'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Get insights into your productivity patterns with comprehensive reports and visualizations.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team through shared projects, assignments, and real-time updates.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Stay on top of deadlines with intelligent reminders that learn from your habits.'
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Set and monitor your goals with progress tracking and achievement milestones.'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-purple-50">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-blue-green bg-clip-text text-transparent">
              Everything you need to stay productive
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover powerful features designed to streamline your workflow and boost
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto ${
                    index % 3 === 0 ? 'bg-gradient-blue-purple' : 
                    index % 3 === 1 ? 'bg-gradient-blue-green' : 
                    'bg-gradient-primary'
                  }`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
