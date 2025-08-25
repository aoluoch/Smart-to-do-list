import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Calendar, Target } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const StatCard: React.FC<{
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}> = ({ title, value, description, icon: Icon, trend, color = 'primary' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="hover:shadow-custom-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`w-4 h-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && (
            <span className="text-success">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {trend}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { tasks, getTaskStats, getNextRecommendedTask, completeTask } = useApp();
  const navigate = useNavigate();
  
  const stats = getTaskStats();
  const nextTask = getNextRecommendedTask();
  const recentTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'muted';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const isOverdue = (deadline: Date) => {
    return new Date() > deadline;
  };

  const getTimeUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (diff < 0) return 'Overdue';
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Due soon';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/tasks')}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Target className="w-4 h-4 mr-2" />
          Manage Tasks
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          description="All tasks"
          icon={CheckSquare}
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          description={`${completionRate}% completion rate`}
          icon={CheckSquare}
          trend="+12%"
          color="success"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          description="Currently working on"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          description="Need attention"
          icon={AlertTriangle}
          color="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Recommended Task */}
        {nextTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Next Recommended Task
                </CardTitle>
                <CardDescription>
                  AI-powered task prioritization based on deadlines and dependencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">{nextTask.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{nextTask.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant={getPriorityBadgeVariant(nextTask.priority)} className="capitalize">
                    {nextTask.priority}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {Math.floor(nextTask.duration / 60)}h {nextTask.duration % 60}m
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {getTimeUntilDeadline(nextTask.deadline)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => completeTask(nextTask.id)}
                    className="bg-gradient-success"
                  >
                    Mark Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/tasks')}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Your task completion progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Completion</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-success">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks that need your attention soon</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={getPriorityBadgeVariant(task.priority)}
                          className="text-xs capitalize"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due {getTimeUntilDeadline(task.deadline)}
                        </span>
                        {isOverdue(task.deadline) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(task.duration / 60)}h {task.duration % 60}m
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming tasks. Great work!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};