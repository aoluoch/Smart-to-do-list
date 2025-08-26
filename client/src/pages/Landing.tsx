import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Calendar, 
  BarChart3, 
  Users, 
  Bell, 
  Target,
  ArrowRight,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
              Master Your Tasks,
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Achieve More</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            >
              Transform your productivity with TaskFlow - the intelligent task management system 
              that adapts to your workflow and helps you achieve your goals faster.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-gradient-primary text-white hover:opacity-90 text-lg px-8 py-3"
              >
                Sign Up
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/login')}
                className="text-lg px-8 py-3"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover powerful features designed to streamline your workflow and boost your productivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Setting up your productivity workflow has never been easier.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why choose TaskFlow?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their productivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join TaskFlow today and experience the difference intelligent task management can make.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-gradient-primary text-white hover:opacity-90 text-lg px-8 py-3"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TaskFlow</span>
          </div>
          <p className="text-muted-foreground">
            © 2025 TaskFlow. All rights reserved. Built for productivity.
          </p>
        </div>
      </footer>
    </div>
  );
};