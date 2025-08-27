import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';
import { DataSet } from 'vis-data';
import 'vis-network/styles/vis-network.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { Task } from '@/types';

interface DependencyGraphData {
  nodes: Task[];
  edges: Array<{ from: string; to: string }>;
  readyTasks: string[];
}

interface DependencyGraphProps {
  onTaskSelect?: (task: Task) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ onTaskSelect }) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getDependencyGraph();
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dependency graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (!graphData || !networkRef.current) return;

    // Prepare nodes for vis-network
    const nodes = new DataSet(
      graphData.nodes.map(task => ({
        id: task.id,
        label: task.title,
        title: `${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}`,
        color: {
          background: getNodeColor(task),
          border: getNodeBorderColor(task),
          highlight: {
            background: getNodeColor(task, true),
            border: getNodeBorderColor(task, true),
          }
        },
        font: {
          color: getNodeTextColor(task),
          size: 14,
        },
        shape: 'box',
        margin: 10,
        widthConstraint: {
          minimum: 100,
          maximum: 200,
        },
        heightConstraint: {
          minimum: 40,
        },
        chosen: {
          node: (values: any, id: string) => {
            values.color = getNodeColor(graphData.nodes.find(t => t.id === id)!, true);
          }
        }
      }))
    );

    // Prepare edges for vis-network
    const edges = new DataSet(
      graphData.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        arrows: 'to',
        color: {
          color: '#64748b',
          highlight: '#3b82f6',
        },
        width: 2,
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'horizontal',
          roundness: 0.4,
        },
      }))
    );

    // Network options
    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          levelSeparation: 200,
          nodeSpacing: 150,
          treeSpacing: 200,
        },
      },
      physics: {
        enabled: false,
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        selectConnectedEdges: false,
      },
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 5,
          x: 2,
          y: 2,
        },
      },
      edges: {
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.1)',
          size: 3,
          x: 1,
          y: 1,
        },
      },
    };

    // Create network
    const network = new Network(networkRef.current, { nodes, edges }, options);
    networkInstance.current = network;

    // Handle node selection
    network.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const task = graphData.nodes.find(t => t.id === nodeId);
        if (task) {
          setSelectedTask(task);
          onTaskSelect?.(task);
        }
      }
    });

    // Handle deselection
    network.on('deselectNode', () => {
      setSelectedTask(null);
    });

    // Cleanup
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [graphData, onTaskSelect]);

  const getNodeColor = (task: Task, highlight = false) => {
    const alpha = highlight ? '0.9' : '0.8';
    
    if (graphData?.readyTasks.includes(task.id)) {
      return highlight ? '#22c55e' : '#16a34a'; // Green for ready tasks
    }
    
    switch (task.status) {
      case 'completed':
        return highlight ? '#64748b' : '#475569'; // Gray for completed
      case 'in-progress':
        return highlight ? '#3b82f6' : '#2563eb'; // Blue for in-progress
      case 'pending':
        return highlight ? '#f59e0b' : '#d97706'; // Orange for pending
      default:
        return highlight ? '#6b7280' : '#4b5563'; // Default gray
    }
  };

  const getNodeBorderColor = (task: Task, highlight = false) => {
    if (highlight) return '#1f2937';
    
    switch (task.priority) {
      case 'high':
        return '#dc2626'; // Red border for high priority
      case 'medium':
        return '#f59e0b'; // Orange border for medium priority
      case 'low':
        return '#10b981'; // Green border for low priority
      default:
        return '#6b7280'; // Default gray border
    }
  };

  const getNodeTextColor = (task: Task) => {
    return '#ffffff'; // White text for better contrast
  };

  const handleZoomIn = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleFit = () => {
    if (networkInstance.current) {
      networkInstance.current.fit();
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dependency Graph</CardTitle>
          <CardDescription>Loading interactive dependency visualization...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dependency Graph</CardTitle>
          <CardDescription>Failed to load dependency graph</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchGraphData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interactive Dependency Graph</CardTitle>
              <CardDescription>
                Visual representation of task dependencies with AI-identified ready tasks
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchGraphData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomIn} variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomOut} variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleFit} variant="outline" size="sm">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded border-2 border-green-700"></div>
                <span>Ready to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-700"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-600 rounded border-2 border-orange-700"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded border-2 border-gray-700"></div>
                <span>Completed</span>
              </div>
            </div>
            
            {/* Graph Container */}
            <div 
              ref={networkRef} 
              className="w-full h-96 border rounded-lg bg-background"
              style={{ minHeight: '400px' }}
            />
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{graphData?.nodes.length || 0}</div>
                <div className="text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{graphData?.edges.length || 0}</div>
                <div className="text-muted-foreground">Dependencies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{graphData?.readyTasks.length || 0}</div>
                <div className="text-muted-foreground">Ready Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {graphData?.nodes.filter(n => n.status === 'pending' && !graphData.readyTasks.includes(n.id)).length || 0}
                </div>
                <div className="text-muted-foreground">Blocked Tasks</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Task Details */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-lg">{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-muted-foreground mt-1">{selectedTask.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(selectedTask.priority)} className="capitalize">
                  {selectedTask.priority} Priority
                </Badge>
                <Badge variant={getStatusColor(selectedTask.status)} className="capitalize">
                  {selectedTask.status.replace('-', ' ')}
                </Badge>
                {graphData?.readyTasks.includes(selectedTask.id) && (
                  <Badge variant="default" className="bg-green-600">
                    Ready to Start
                  </Badge>
                )}
              </div>
              {selectedTask.deadline && (
                <div className="text-sm text-muted-foreground">
                  <strong>Deadline:</strong> {new Date(selectedTask.deadline).toLocaleDateString()}
                </div>
              )}
              {selectedTask.duration && (
                <div className="text-sm text-muted-foreground">
                  <strong>Estimated Duration:</strong> {selectedTask.duration} minutes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
