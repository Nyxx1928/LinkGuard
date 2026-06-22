import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, Search, LogIn, UserPlus, LogOut, User, History, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import Button from '../ui/Button';
import { Separator } from '../ui/separator';

/**
 * MobileNav - Mobile navigation drawer component
 * 
 * Features:
 * - Hamburger menu icon with Sheet drawer
 * - Touch-friendly navigation links (min 44px height)
 * - Smooth slide-out animations
 * - Backdrop overlay
 * - Responsive to authentication state
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * @param {Object} props
 * @param {boolean} props.isAuthenticated - Whether user is logged in
 * @param {Function} props.onLogout - Logout handler function
 * @param {string} props.userName - Current user's name (optional)
 */
const MobileNav = ({ isAuthenticated = false, onLogout = null, userName = null }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false); // Close drawer after navigation
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px] border-l border-hairline bg-canvas p-0">
        <div className="flex flex-col h-full p-6">
          <SheetHeader className="pb-4 border-b border-hairline">
            <SheetTitle className="text-left">
              <span className="text-2xl font-bold text-primary">
                LinkGuard
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-2 mt-6 flex-1">
            {/* Public Navigation Links */}
            <NavLink
              icon={<Home className="h-5 w-5" />}
              label="Home"
              onClick={() => handleNavigation('/')}
              isActive={isActive('/')}
            />

            {isAuthenticated ? (
              <>
                <NavLink
                  icon={<Search className="h-5 w-5" />}
                  label="Analyze"
                  onClick={() => handleNavigation('/analyze')}
                  isActive={isActive('/analyze')}
                />
                <NavLink
                  icon={<History className="h-5 w-5" />}
                  label="History"
                  onClick={() => handleNavigation('/history')}
                  isActive={isActive('/history')}
                />
              </>
            ) : (
              <NavLink
                icon={<Search className="h-5 w-5" />}
                label="Analyze"
                onClick={() => handleNavigation('/login')}
                isActive={false}
              />
            )}

            <NavLink
              icon={<Info className="h-5 w-5" />}
              label="About"
              onClick={() => handleNavigation('/about')}
              isActive={isActive('/about')}
            />

            <Separator className="my-4 bg-hairline" />

            {/* Authentication Section */}
            {!isAuthenticated ? (
              <>
                <NavLink
                  icon={<LogIn className="h-5 w-5" />}
                  label="Log In"
                  onClick={() => handleNavigation('/login')}
                  isActive={isActive('/login')}
                />
                <NavLink
                  icon={<UserPlus className="h-5 w-5" />}
                  label="Sign Up"
                  onClick={() => handleNavigation('/register')}
                  isActive={isActive('/register')}
                />
              </>
            ) : (
              <>
                {userName && (
                  <div className="flex items-center gap-3 px-3 py-3 bg-canvas-soft border border-hairline rounded-sm">
                    <User className="h-5 w-5 text-mute" />
                    <span className="text-sm font-medium text-ink">
                      {userName}
                    </span>
                  </div>
                )}
                <NavLink
                  icon={<LogOut className="h-5 w-5" />}
                  label="Logout"
                  onClick={handleLogout}
                  variant="destructive"
                />
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

/**
 * NavLink - Touch-friendly navigation link component
 * 
 * Ensures minimum 44px height for touch targets
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.label - Link text
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isActive - Whether link is active
 * @param {string} props.variant - Button variant (default or destructive)
 */
const NavLink = ({ icon, label, onClick, isActive = false, variant = 'ghost' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 w-full px-3 py-3 rounded-sm
        min-h-[44px] text-left transition-all duration-200
        ${isActive 
          ? 'bg-canvas-soft text-primary' 
          : variant === 'destructive'
          ? 'text-risk-danger hover:bg-risk-danger/10'
          : 'text-mute hover:bg-canvas-soft hover:text-ink'
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
      `}
    >
      {icon}
      <span className="text-base font-medium">{label}</span>
    </button>
  );
};

export default MobileNav;
