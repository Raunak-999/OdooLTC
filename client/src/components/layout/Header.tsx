import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { SearchIcon, MenuIcon, UserIcon, LogOutIcon, PlusIcon, SettingsIcon, MessageSquareIcon, FileTextIcon, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAskButtonLoading, setIsAskButtonLoading] = useState(false);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        handleClearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [searchQuery]);

  const handleAskQuestion = () => {
    console.log('🏠 Header: Ask Question clicked:', {
      hasUser: !!user,
      loading,
      userDetails: user ? { uid: user.uid, email: user.email } : null
    });

    if (loading) {
      console.log('🏠 Header: Auth still loading, ignoring click');
      return; // Don't do anything while auth is loading
    }
    
    if (user) {
      // User is authenticated, go directly to ask question page
      console.log('🏠 Header: User authenticated, navigating to /ask');
      setLocation('/ask');
    } else {
      // User is not authenticated, redirect to login with return URL
      console.log('🏠 Header: User not authenticated, redirecting to login');
      setIsAskButtonLoading(true);
      setLocation('/login?redirect=/ask&message=Please sign in to ask a question');
      setIsAskButtonLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🏠 Header: Logout clicked');
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      setLocation('/');
    } catch (error) {
      console.error('🏠 Header: Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "error",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Navigate back to home without search query
    setLocation('/');
  };

  const handleLogoClick = () => {
    // Clear search when clicking logo
    if (searchQuery) {
      setSearchQuery('');
    }
    setLocation('/');
  };



  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" onClick={handleLogoClick}>
              <h1 className="text-2xl font-bold text-white hover:text-[var(--accent-blue)] cursor-pointer transition-colors">
                StackIt
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-[var(--text-secondary)] hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
            </nav>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <Input
                id="search-input"
                type="text"
                placeholder="Search questions... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-white placeholder-[var(--text-muted)] focus:bg-[var(--bg-tertiary)] focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] rounded-lg"
              />
              
              {/* Clear button (X) when there's input */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Search button */}
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[var(--accent-blue)] hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Ask Question Button */}
            <Button 
              onClick={handleAskQuestion}
              disabled={loading || isAskButtonLoading}
              className="bg-[var(--accent-blue)] hover:bg-blue-700 text-white font-medium flex items-center gap-2 text-sm md:text-base transition-colors rounded-lg px-4 py-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {loading ? 'Loading...' : 'Ask Question'}
              </span>
              <span className="sm:hidden">
                {loading ? '...' : 'Ask'}
              </span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-gray-700 text-white text-sm">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/profile?tab=questions')}>
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    <span>My Questions</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/profile?tab=answers')}>
                    <MessageSquareIcon className="mr-2 h-4 w-4" />
                    <span>My Answers</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation('/profile?tab=settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/login?mode=signin')}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => setLocation('/login?mode=signup')}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>


      </div>
    </header>
  );
}
