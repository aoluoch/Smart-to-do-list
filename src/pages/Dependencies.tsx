import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, List, Network, AlertTriangle, CheckSquare, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Dependencies: React.FC = () => {
  const { tasks } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  // Build dependency graph
  const buildDependencyGraph = () => {
    const nodes = tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dependencies: task.dependencies,
    }));

    const edges = tasks.flatMap(task => 
      task.dependencies.map(depId => ({
        from: depId,
        to: task.id,
      }))
    );

    return { nodes, edges };
  };

  // Find critical path (mock implementation)
  const findCriticalPath = () => {
    // Simple critical path detection based on dependency chains
    const dependencyChains: string[][] = [];
    
    tasks.forEach(task => {
      if (task.dependencies.length === 0) {
        // Start of a chain
        const chain = [task.id];
        let current = task.id;
        
        while (true) {
          const dependent = tasks.find(t => t.dependencies.includes(current));
          if (dependent) {
            chain.push(dependent.id);
            current = dependent.id;
          } else {
            break;
          }
        }
        
        if (chain.length > 1) {
          dependencyChains.push(chain);
        }
      }
    });

    // Find longest chain (critical path)
    const criticalPath = dependencyChains.reduce((longest, current) => 
      current.length > longest.length ? current : longest, []
    );

    return criticalPath;
  };

  // Detect circular dependencies
  const detectCircularDependencies = () => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circular: string[] = [];

    const hasCycle = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) {
        circular.push(taskId);
        return true;
      }
      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    tasks.forEach(task => {
      if (!visited.has(task.id)) {
        hasCycle(task.id);
      }
    });

    return circular;
  };

  // Get blocked tasks (tasks waiting for dependencies)
  const getBlockedTasks = () => {
    return tasks.filter(task => 
      task.status === 'pending' && 
      task.dependencies.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'completed';
      })
    );
  };

  // Get ready tasks (tasks with no incomplete dependencies)
  const getReadyTasks = () => {
    return tasks.filter(task => 
      task.status === 'pending' && 
      task.dependencies.every(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status === 'completed';
      })
    );
  };

  const { nodes, edges } = buildDependencyGraph();
  const criticalPath = findCriticalPath();
  const circularDeps = detectCircularDependencies();
  const blockedTasks = getBlockedTasks();
  const readyTasks = getReadyTasks();

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

  const TaskCard: React.FC<{ task: any; highlight?: boolean }> = ({ task, highlight }) => (
    <div className={`
      p-3 rounded-lg border transition-all duration-200
      ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-card-foreground">{task.title}</h4>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getPriorityColor(task.priority)} className="text-xs capitalize">
              {task.priority}
            </Badge>
            <Badge variant={getStatusColor(task.status)} className="text-xs capitalize">
              {task.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        {task.status === 'completed' && (
          <CheckSquare className="w-4 h-4 text-success flex-shrink-0" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Dependencies</h1>
          <p className="text-muted-foreground mt-1">
            Visualize task dependencies and identify critical paths
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button 
            variant={viewMode === 'graph' ? 'default' : 'outline'} 
            onClick={() => setViewMode('graph')}
          >
            <Network className="w-4 h-4 mr-2" />
            Graph View
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {circularDeps.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Circular dependency detected! This can cause infinite loops and should be resolved.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{edges.length}</div>
                <div className="text-xs text-muted-foreground">Dependencies</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <div>
                <div className="text-2xl font-bold">{blockedTasks.length}</div>
                <div className="text-xs text-muted-foreground">Blocked Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-success" />
              <div>
                <div className="text-2xl font-bold">{readyTasks.length}</div>
                <div className="text-xs text-muted-foreground">Ready Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              <div>
                <div className="text-2xl font-bold">{criticalPath.length}</div>
                <div className="text-xs text-muted-foreground">Critical Path</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'list' | 'graph')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="graph">Graph View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Critical Path
                </CardTitle>
                <CardDescription>
                  The longest sequence of dependent tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalPath.length > 0 ? (
                  criticalPath.map((taskId, index) => {
                    const task = tasks.find(t => t.id === taskId);
                    if (!task) return null;
                    
                    return (
                      <motion.div
                        key={taskId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <TaskCard task={task} highlight />
                        {index < criticalPath.length - 1 && (
                          <div className="flex justify-center my-2">
                            <div className="w-px h-4 bg-primary/30" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No critical path found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blocked Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  Blocked Tasks
                </CardTitle>
                <CardDescription>
                  Tasks waiting for dependencies to complete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {blockedTasks.length > 0 ? (
                  blockedTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TaskCard task={task} />
                      <div className="ml-4 mt-2 text-xs text-muted-foreground">
                        Waiting for: {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          return depTask?.title;
                        }).filter(Boolean).join(', ')}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No blocked tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ready Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-success" />
                Ready to Start
              </CardTitle>
              <CardDescription>
                Tasks with all dependencies completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readyTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks ready to start</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Graph</CardTitle>
              <CardDescription>
                Visual representation of task dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-muted-foreground">
                <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Graph Visualization</h3>
                <p className="mb-4">
                  Interactive dependency graph would be rendered here using a graph visualization library like D3.js or vis.js
                </p>
                <div className="text-sm space-y-2">
                  <p><strong>Nodes:</strong> {nodes.length} tasks</p>
                  <p><strong>Edges:</strong> {edges.length} dependencies</p>
                  <p><strong>Critical Path Length:</strong> {criticalPath.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};