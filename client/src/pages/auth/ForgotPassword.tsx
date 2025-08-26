import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Target, Home, Phone, MessageCircle, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { adminConfig } from '@/config/admin';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Please copy the information manually',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowContactInfo(false);

    try {
      // TODO: Replace with actual API call to backend
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Reset link sent!',
          description: 'Check your email for password reset instructions.',
        });
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (err) {
      // Show admin contact info instead of generic error
      setShowContactInfo(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 flex items-center justify-center p-4">
        {/* Back to Home Button */}
        <Link 
          to="/" 
          className="fixed top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border group-hover:bg-background transition-colors">
            <Home className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-custom-lg border-0 text-center">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-success rounded-2xl mb-4 shadow-glow"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    className="text-primary hover:underline"
                    onClick={() => setIsSubmitted(false)}
                  >
                    try again
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border group-hover:bg-background transition-colors">
          <Home className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-card-foreground">TaskFlow</h1>
          <p className="text-muted-foreground mt-2">Intelligent task management</p>
        </div>

        <Card className="shadow-custom-lg border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
              If you encounter any issues, our admin team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {showContactInfo && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <div className="space-y-3">
                      <p className="font-medium">Need help with password reset?</p>
                      <p className="text-sm">Please contact our admin team for assistance:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{adminConfig.email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(adminConfig.email, 'Email')}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Copy email"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{adminConfig.phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(adminConfig.phone, 'Phone number')}
                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                            title="Copy phone number"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        {adminConfig.liveChatAvailable && (
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3 w-3" />
                            <span>Live chat available {adminConfig.supportHours}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Include your email address when contacting support.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Need immediate help?{' '}
                <button
                  type="button"
                  onClick={() => setShowContactInfo(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Contact Admin
                </button>
              </p>

              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};