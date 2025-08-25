import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '@/hooks/useApp';
import { Task } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  const { addTask, updateTask, tasks } = useApp();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    duration: 60, // in minutes
    deadline: new Date(),
    dependencies: [] as string[],
    notes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        duration: task.duration,
        deadline: task.deadline,
        dependencies: task.dependencies,
        notes: task.notes || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        duration: 60,
        deadline: new Date(),
        dependencies: [],
        notes: '',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    if (formData.deadline < new Date()) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const taskData = {
        ...formData,
        status: task?.status || 'pending' as const,
        dependencies: formData.dependencies,
      };

      if (task) {
        updateTask(task.id, taskData);
        toast({
          title: 'Task updated',
          description: 'Your task has been successfully updated.',
        });
      } else {
        addTask(taskData);
        toast({
          title: 'Task created',
          description: 'Your new task has been added successfully.',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const availableTasks = tasks.filter(t => t.id !== task?.id && t.status !== 'completed');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? 'Update the details of your task below.'
              : 'Add a new task to your schedule. Fill in the details below.'
            }
          </DialogDescription>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={cn(errors.title && 'border-destructive')}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your task (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                className={cn(errors.duration && 'border-destructive')}
              />
              {errors.duration && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.duration}
                </p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label>Deadline *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.deadline && 'text-muted-foreground',
                    errors.deadline && 'border-destructive'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => date && handleInputChange('deadline', date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.deadline && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {errors.deadline}
              </p>
            )}
          </div>

          {/* Dependencies */}
          {availableTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Dependencies (optional)</Label>
              <Select
                value={formData.dependencies[0] || 'none'}
                onValueChange={(value) => 
                  handleInputChange('dependencies', value === 'none' ? [] : [value])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a dependency task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No dependencies</SelectItem>
                  {availableTasks.map((depTask) => (
                    <SelectItem key={depTask.id} value={depTask.id}>
                      {depTask.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes (optional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isSubmitting 
                ? (task ? 'Updating...' : 'Creating...') 
                : (task ? 'Update Task' : 'Create Task')
              }
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};