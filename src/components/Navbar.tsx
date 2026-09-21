import React, { useState, useEffect } from 'react';
import { Layers, Menu, X, ArrowRight, Activity } from 'lucide-react';
import { SystemStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  status: SystemStatus;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onRefresh: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  isDemoMode,
  onToggleDemoMode,
  onRefresh,
  isScanning,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Simple active link detection
      const sections = ['home', 'why-depthwizard', 'how-it-works', 'technology', 'demo-workspace'];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-geo-bg/90 backdrop-blur-md border-b border-geo-border py-3 shadow-geo-card'
          : 'bg-transparent border-b border-transparent py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 text-left group transition-transform focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-geo-surface border border-geo-border flex items-center justify-center text-geo-cyan group-hover:border-geo-cyan/60 transition-colors shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-geo-text group-hover:text-white transition-colors">
                DepthWizard
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-geo-surface text-geo-cyan border border-geo-border">
                SIH 2026 • PS 26175
              </span>
            </div>
            <p className="text-[11px] text-geo-muted hidden md:block">
              Single-View Height Estimation & 3D Flythrough
            </p>
          </div>
        </button>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-geo-surface/80 border border-geo-border/80 px-2 py-1 rounded-full backdrop-blur-md">
          <button
            onClick={() => scrollToSection('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeNav === 'home'
                ? 'bg-geo-elevated text-geo-text shadow-sm'
                : 'text-geo-muted hover:text-geo-text'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('why-depthwizard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeNav === 'why-depthwizard'
                ? 'bg-geo-elevated text-geo-text shadow-sm'
                : 'text-geo-muted hover:text-geo-text'
            }`}
          >
            Why DepthWizard
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeNav === 'how-it-works'
                ? 'bg-geo-elevated text-geo-text shadow-sm'
                : 'text-geo-muted hover:text-geo-text'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('technology')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeNav === 'technology'
                ? 'bg-geo-elevated text-geo-text shadow-sm'
                : 'text-geo-muted hover:text-geo-text'
            }`}
          >
            Technology
          </button>
          <button
            onClick={() => scrollToSection('demo-workspace')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeNav === 'demo-workspace'
                ? 'bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/30'
                : 'text-geo-muted hover:text-geo-text'
            }`}
          >
            Demo
          </button>
        </nav>

        {/* Right CTA Button & Status Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2">
            <StatusBadge status={status} size="sm" />
          </div>

          <button
            onClick={() => scrollToSection('demo-workspace')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono transition-all shadow-sm hover:shadow-geo-glow"
          >
            <span>Launch Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg text-geo-muted hover:text-white bg-geo-surface border border-geo-border lg:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-geo-bg-alt/98 border-b border-geo-border px-5 py-4 space-y-3 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => scrollToSection('home')}
              className="text-left px-3 py-2 rounded-lg text-sm text-geo-text hover:bg-geo-surface"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('why-depthwizard')}
              className="text-left px-3 py-2 rounded-lg text-sm text-geo-text hover:bg-geo-surface"
            >
              Why DepthWizard
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2 rounded-lg text-sm text-geo-text hover:bg-geo-surface"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('technology')}
              className="text-left px-3 py-2 rounded-lg text-sm text-geo-text hover:bg-geo-surface"
            >
              Technology
            </button>
            <button
              onClick={() => scrollToSection('demo-workspace')}
              className="text-left px-3 py-2 rounded-lg text-sm font-medium text-geo-cyan hover:bg-geo-surface flex items-center justify-between"
            >
              <span>Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-3 border-t border-geo-border flex items-center justify-between">
            <span className="text-xs text-geo-muted font-mono">System:</span>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
      )}
    </header>
  );
};
