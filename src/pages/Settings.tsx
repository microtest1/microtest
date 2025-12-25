import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Moon, Globe, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [testResults, setTestResults] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [language, setLanguage] = React.useState("en");
  const [dataSharing, setDataSharing] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);

  const handleSave = () => {
    // Here you would typically save these settings to your backend
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleUpgradePlan = () => {
    // Here you would typically redirect to the subscription page
    toast({
      title: "Upgrade Plan",
      description: "Redirecting to subscription options...",
    });
  };

  React.useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="test-results">Test results alerts</Label>
                <Switch
                  id="test-results"
                  checked={testResults}
                  onCheckedChange={setTestResults}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark mode</Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing">Data sharing</Label>
                <Switch
                  id="data-sharing"
                  checked={dataSharing}
                  onCheckedChange={setDataSharing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Analytics</Label>
                <Switch
                  id="analytics"
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Current Plan: <span className="font-semibold text-foreground">Free Tier</span>
              </div>
              <Button 
                onClick={handleUpgradePlan}
                className="w-full btn-premium"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="btn-premium"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;