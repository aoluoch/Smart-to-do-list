import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  CheckSquare2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskModal } from '@/components/modals/TaskModal';
import { formatDistanceToNow } from 'date-fns';

export const Tasks: React.FC = () => {
  const { tasks, completeTask, deleteTask } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const isOverdue = (deadline: Date, status: string) => {
    return status !== 'completed' && new Date() > deadline;
  };

  const handleTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your tasks in one place
          </p>
        </div>
        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTaskComplete(task.id)}
                        disabled={task.status === 'completed'}
                        className="p-1 h-8 w-8"
                      >
                        <CheckSquare2 className={`w-4 h-4 ${
                          task.status === 'completed' 
                            ? 'text-success' 
                            : 'text-muted-foreground hover:text-success'
                        }`} />
                      </Button>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium text-card-foreground flex items-center gap-2">
                          {task.title}
                          {isOverdue(task.deadline, task.status) && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                        {task.priority}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusColor(task.status)} className="capitalize">
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={
                          isOverdue(task.deadline, task.status) 
                            ? 'text-destructive font-medium' 
                            : 'text-muted-foreground'
                        }>
                          {formatDistanceToNow(task.deadline, { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {Math.floor(task.duration / 60)}h {task.duration % 60}m
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTaskEdit(task)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTaskDelete(task.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Create your first task to get started'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                <Button onClick={() => setIsTaskModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={handleModalClose}
        task={editingTask}
      />
    </div>
  );
};