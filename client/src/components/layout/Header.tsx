import React, { useState } from 'react';
import { Bell, Settings, User, LogOut, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useApp';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, notifications, markNotificationAsRead, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (notificationId: string, taskId?: string) => {
    markNotificationAsRead(notificationId);
    if (taskId) {
      navigate('/tasks');
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border shadow-custom-sm px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted/30 border-0 focus:bg-background transition-colors"
        />
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadNotifications.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {unreadNotifications.length} unread
                </p>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              <AnimatePresence>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification.id, notification.taskId)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-2"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};