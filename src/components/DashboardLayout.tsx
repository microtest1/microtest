import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Microscope, 
  LayoutDashboard, 
  Camera, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Users,
  FileText,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/scanner', icon: Camera, label: 'New Test' },
  { path: '/history', icon: History, label: 'Test History' },
  { path: '/datasets', icon: FileText, label: 'Reference Datasets' },
  { path: '/subscription', icon: CreditCard, label: 'Subscription' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { path: '/admin', icon: Users, label: 'Admin Console' },
  { path: '/admin/datasets', icon: FileText, label: 'Datasets' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, profile, role } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen gradient-mesh relative">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-primary w-[600px] h-[600px] -top-64 -right-64 opacity-40 animate-blob" />
        <div className="orb orb-accent w-[500px] h-[500px] bottom-0 -left-64 opacity-30 animate-blob stagger-3" />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
              <Microscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold font-display text-lg">MicroTest</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-72 glass-card border-r border-border/50 transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-4 p-6 border-b border-border/50">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
              <Microscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold font-display text-xl">MicroTest</h1>
              <p className="text-xs text-muted-foreground">AI Health Diagnostics</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {role || 'Patient'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                    isActive 
                      ? "gradient-primary text-primary-foreground glow-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              );
            })}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="pt-6 pb-2">
                  <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                        isActive 
                          ? "gradient-accent text-accent-foreground glow-accent" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
              </>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border/50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 pt-20 lg:pt-0 min-h-screen relative">
        <div className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};