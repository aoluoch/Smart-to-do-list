import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, CheckSquare } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COLORS = {
  high: 'hsl(var(--priority-high))',
  medium: 'hsl(var(--priority-medium))',
  low: 'hsl(var(--priority-low))',
  completed: 'hsl(var(--success))',
  pending: 'hsl(var(--warning))',
  overdue: 'hsl(var(--destructive))',
};

export const Analytics: React.FC = () => {
  const { tasks, getTaskStats } = useApp();
  const stats = getTaskStats();

  // Priority distribution data
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: COLORS.high },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: COLORS.medium },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: COLORS.low },
  ].filter(item => item.value > 0);

  // Status distribution data
  const statusData = [
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Pending', value: stats.pending, color: COLORS.pending },
    { name: 'Overdue', value: stats.overdue, color: COLORS.overdue },
  ].filter(item => item.value > 0);

  // Velocity data - calculate from actual task completion data
  const velocityData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const completedTasks = tasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate.toDateString() === date.toDateString();
      }).length;

      return {
        day: dayName,
        completed: completedTasks,
      };
    });
  }, [tasks]);

  // Task duration distribution
  const durationData = [
    { range: '< 1h', count: tasks.filter(t => t.duration < 60).length },
    { range: '1-2h', count: tasks.filter(t => t.duration >= 60 && t.duration < 120).length },
    { range: '2-4h', count: tasks.filter(t => t.duration >= 120 && t.duration < 240).length },
    { range: '4h+', count: tasks.filter(t => t.duration >= 240).length },
  ].filter(item => item.count > 0);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const averageDuration = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length) 
    : 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: string;
  }> = ({ title, value, description, icon: Icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-custom-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="w-4 h-4 text-primary" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your productivity and task completion patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button variant="outline">Export PDF</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="of all tasks completed"
          icon={CheckSquare}
          trend="+5%"
        />
        <StatCard
          title="Total Tasks"
          value={stats.total}
          description="tasks managed"
          icon={Target}
        />
        <StatCard
          title="Average Duration"
          value={formatDuration(averageDuration)}
          description="per task"
          icon={Clock}
        />
        <StatCard
          title="Weekly Velocity"
          value={velocityData.reduce((sum, day) => sum + day.completed, 0)}
          description="tasks completed this week"
          icon={TrendingUp}
          trend="+12%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Velocity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Velocity</CardTitle>
              <CardDescription>Tasks completed per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={velocityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
                    className="text-muted-foreground text-xs"
                  />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Breakdown of tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {priorityData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>Current status of all tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Duration Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Duration Distribution</CardTitle>
              <CardDescription>Tasks grouped by estimated duration</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="range" 
                    className="text-muted-foreground text-xs"
                  />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};