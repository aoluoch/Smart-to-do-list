import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Clock, Palette, Shield, Download, Upload } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export const Settings: React.FC = () => {
  const { user, logout } = useApp();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    workCapacity: user?.workCapacity || 8,
  });
  
  const [notifications, setNotifications] = useState({
    emailReminders: user?.emailReminders ?? true,
    pushNotifications: true,
    deadlineAlerts: true,
    dependencyUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    timeFormat: '24h',
    startWeek: 'monday',
    defaultTaskDuration: 60,
  });

  const handleProfileSave = () => {
    // Mock save functionality
    toast({
      title: 'Profile updated',
      description: 'Your profile settings have been saved successfully.',
    });
  };

  const handleNotificationSave = () => {
    toast({
      title: 'Notification settings updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  const handlePreferencesSave = () => {
    toast({
      title: 'Preferences updated',
      description: 'Your preferences have been saved successfully.',
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Data exported',
      description: 'Your data has been exported to CSV format.',
    });
  };

  const handleImportData = () => {
    toast({
      title: 'Data imported',
      description: 'Your data has been imported successfully.',
    });
  };

  const SettingsSection: React.FC<{
    title: string;
    description: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }> = ({ title, description, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <SettingsSection
          title="Profile"
          description="Manage your personal information and account details"
          icon={User}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback className="bg-gradient-primary text-white text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Full Name</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workCapacity">Daily Work Capacity (hours)</Label>
              <Input
                id="workCapacity"
                type="number"
                min="1"
                max="16"
                value={profile.workCapacity}
                onChange={(e) => setProfile({...profile, workCapacity: parseInt(e.target.value) || 8})}
              />
            </div>
          </div>
          
          <Button onClick={handleProfileSave} className="w-full">
            Save Profile
          </Button>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          description="Configure how and when you receive notifications"
          icon={Bell}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive task reminders via email</p>
              </div>
              <Switch
                checked={notifications.emailReminders}
                onCheckedChange={(checked) => setNotifications({...notifications, emailReminders: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deadline Alerts</Label>
                <p className="text-sm text-muted-foreground">Alerts for upcoming deadlines</p>
              </div>
              <Switch
                checked={notifications.deadlineAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, deadlineAlerts: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dependency Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications when dependencies are completed</p>
              </div>
              <Switch
                checked={notifications.dependencyUpdates}
                onCheckedChange={(checked) => setNotifications({...notifications, dependencyUpdates: checked})}
              />
            </div>
          </div>
          
          <Button onClick={handleNotificationSave} className="w-full">
            Save Notifications
          </Button>
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection
          title="Preferences"
          description="Customize your app experience"
          icon={Palette}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <select
                id="timeFormat"
                className="w-full p-2 border border-border rounded-md bg-background text-card-foreground"
                value={preferences.timeFormat}
                onChange={(e) => setPreferences({...preferences, timeFormat: e.target.value})}
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startWeek">Week starts on</Label>
              <select
                id="startWeek"
                className="w-full p-2 border border-border rounded-md bg-background text-card-foreground"
                value={preferences.startWeek}
                onChange={(e) => setPreferences({...preferences, startWeek: e.target.value})}
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultDuration">Default Task Duration (minutes)</Label>
              <Input
                id="defaultDuration"
                type="number"
                min="15"
                step="15"
                value={preferences.defaultTaskDuration}
                onChange={(e) => setPreferences({...preferences, defaultTaskDuration: parseInt(e.target.value) || 60})}
              />
            </div>
          </div>
          
          <Button onClick={handlePreferencesSave} className="w-full">
            Save Preferences
          </Button>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection
          title="Data Management"
          description="Import, export, and manage your data"
          icon={Download}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" onClick={handleImportData} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-destructive">Danger Zone</Label>
              <p className="text-sm text-muted-foreground">
                These actions cannot be undone. Please be careful.
              </p>
              <Button 
                variant="destructive" 
                onClick={logout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};