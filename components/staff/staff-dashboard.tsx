'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RoomBooking } from './room-booking';
import { History } from './history';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { LogoutConfirmationDialog } from '../ui/confirm-message';
import { CalendarCheck, Clock, LogOut, Menu, X, Moon, Sun, ArrowLeft, Home, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';

export function StaffDashboard() {
  const [activeSection, setActiveSection] = useState('booking');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['booking']);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Session and role checking
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login?callbackUrl=/staff');
    }
    if (status === 'authenticated' && session?.user?.role !== 'STAFF') {
      redirect('/unauthorized');
    }
  }, [status, session]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Update navigation history
  useEffect(() => {
    setNavigationHistory((prev) => {
      const newHistory = [...prev];
      if (newHistory[newHistory.length - 1] !== activeSection) {
        newHistory.push(activeSection);
      }
      return newHistory;
    });
  }, [activeSection]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  const handleBack = () => {
    setNavigationHistory((prev) => {
      if (prev.length <= 1) {
        setActiveSection('booking');
        return ['booking'];
      }
      const newHistory = prev.slice(0, -1);
      setActiveSection(newHistory[newHistory.length - 1]);
      return newHistory;
    });
  };

  const handleBackToHome = () => {
    router.push('/');
    router.refresh();
    setMobileNavOpen(false);
  };

  // Navigation items
  const navItems = [
    { id: 'booking', icon: CalendarCheck, label: 'Room Booking' },
    { id: 'history', icon: Clock, label: 'Booking History' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'booking':
        return <RoomBooking />;
      case 'history':
        return <History />;
      default:
        return <RoomBooking />;
    }
  };

  // Consolidated loading check
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navigation Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="bg-white dark:bg-gray-800 shadow-md border-blue-200 dark:border-blue-700"
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileNavOpen ? <X className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <Menu className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
        aria-label="Staff navigation"
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 p-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Button
              variant="ghost"
              className="text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Button
                    variant={activeSection === item.id ? 'secondary' : 'ghost'}
                    className={`w-full justify-start text-gray-800 dark:text-gray-200 ${
                      activeSection === item.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-blue-50 dark:hover:bg-blue-900'
                    }`}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileNavOpen(false);
                    }}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto">
            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-3 p-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
                  title={session.user?.name || ''}
                >
                  {session.user?.name}
                </p>
                <Badge
                  variant="outline"
                  className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                >
                  STAFF
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {activeSection !== 'booking' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleBack}
                    className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {navItems.find((item) => item.id === activeSection)?.label}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                className="border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => setLogoutDialogOpen(true)}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          </div>

          {/* Dashboard Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      <LogoutConfirmationDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
};