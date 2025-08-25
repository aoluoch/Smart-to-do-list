import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Task } from '@/types';

export const Calendar: React.FC = () => {
  const { tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.deadline), date));
  };

  // Get total duration for a date
  const getTotalDurationForDate = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    return dayTasks.reduce((total, task) => total + task.duration, 0);
  };

  // Check if date has overdue tasks
  const hasOverdueTasks = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    return dayTasks.some(task => task.status !== 'completed' && new Date() > new Date(task.deadline));
  };

  const handleDateClick = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    setSelectedDate(date);
    setSelectedTasks(dayTasks);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDayIntensity = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    const taskCount = dayTasks.length;
    const hasHighPriority = dayTasks.some(task => task.priority === 'high');
    
    if (taskCount === 0) return '';
    if (hasHighPriority || taskCount > 3) return 'bg-priority-high/20 border-priority-high/30';
    if (taskCount > 1) return 'bg-priority-medium/20 border-priority-medium/30';
    return 'bg-priority-low/20 border-priority-low/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View your tasks in a calendar format and plan your schedule
          </p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {monthDays.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentDate);
              const totalDuration = getTotalDurationForDate(date);
              const isOverdue = hasOverdueTasks(date);

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  className={`
                    min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/30'}
                    ${isToday ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}
                    ${getDayIntensity(date)}
                    ${dayTasks.length > 0 ? 'hover:scale-105' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      text-sm font-medium
                      ${isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-card-foreground' : 'text-muted-foreground'}
                    `}>
                      {format(date, 'd')}
                    </span>
                    {isOverdue && (
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    )}
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`
                          text-xs p-1 rounded truncate
                          ${task.priority === 'high' ? 'bg-priority-high/20 text-priority-high' :
                            task.priority === 'medium' ? 'bg-priority-medium/20 text-priority-medium' :
                            'bg-priority-low/20 text-priority-low'}
                        `}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Duration Indicator */}
                  {totalDuration > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(totalDuration)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Details Modal */}
      <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedTasks.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} scheduled
                  {' • '}
                  Total: {formatDuration(selectedTasks.reduce((sum, task) => sum + task.duration, 0))}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className="p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-card-foreground">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs capitalize">
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(task.duration)}
                          </div>
                          {task.status !== 'completed' && new Date() > new Date(task.deadline) && (
                            <div className="flex items-center gap-1 text-destructive mt-1">
                              <AlertTriangle className="w-3 h-3" />
                              Overdue
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks scheduled for this day</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};