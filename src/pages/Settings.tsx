import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { Bell, Moon, Palette, Shield, Languages } from "lucide-react";

const SettingsPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      tasks: true,
      system: false,
    },
    appearance: {
      theme: "system",
      compactMode: false,
      highContrast: false,
    },
    privacy: {
      showOnlineStatus: true,
      shareActivityData: false,
      allowAnalytics: true,
    },
    language: "english",
  });
  
  const handleNotificationChange = (key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked,
      },
    }));
  };
  
  const handleAppearanceChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }));
  };
  
  const handlePrivacyChange = (key: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: checked,
      },
    }));
  };
  
  const handleLanguageChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      language: value,
    }));
  };
  
  const handleSaveSettings = () => {
    // In a real app, send settings to server
    toast.success("Settings saved successfully");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Settings Categories</CardTitle>
              <CardDescription>Configure your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Moon className="mr-2 h-4 w-4" />
                  Appearance
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Languages className="mr-2 h-4 w-4" />
                  Language
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy & Security
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-notifications">Task Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about task assignments and updates
                  </p>
                </div>
                <Switch
                  id="task-notifications"
                  checked={settings.notifications.tasks}
                  onCheckedChange={(checked) => handleNotificationChange("tasks", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-notifications">System Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important system-wide announcements
                  </p>
                </div>
                <Switch
                  id="system-notifications"
                  checked={settings.notifications.system}
                  onCheckedChange={(checked) => handleNotificationChange("system", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleAppearanceChange("theme", value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system theme
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing to fit more content on screen
                  </p>
                </div>
                <Switch
                  id="compact-mode"
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => handleAppearanceChange("compactMode", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>
                Set your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">Interface Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="online-status">Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Show when you are online to other users
                  </p>
                </div>
                <Switch
                  id="online-status"
                  checked={settings.privacy.showOnlineStatus}
                  onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activity-data">Activity Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your activity data with administrators
                  </p>
                </div>
                <Switch
                  id="activity-data"
                  checked={settings.privacy.shareActivityData}
                  onCheckedChange={(checked) => handlePrivacyChange("shareActivityData", checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data for improving the system
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.privacy.allowAnalytics}
                  onCheckedChange={(checked) => handlePrivacyChange("allowAnalytics", checked)}
                />
              </div>
            </CardContent>
          </Card>
          
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Advanced settings for administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  These settings are only visible to administrators and affect the entire system.
                </p>
                
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full">
                    System Configuration
                  </Button>
                  <Button variant="secondary" className="w-full">
                    User Management
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Company Settings
                  </Button>
                  <Button variant="secondary" className="w-full">
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
