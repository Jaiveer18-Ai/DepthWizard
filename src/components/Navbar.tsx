import React, { useState, useEffect } from 'react';
import { Layers, Menu, X, ArrowRight } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState(false);

  // Slide-down animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'why-depthwizard', label: 'Why DepthWizard' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'technology', label: 'Technology' },
    { id: 'demo-workspace', label: 'Demo' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      } ${
        isScrolled
          ? 'bg-geo-bg/85 backdrop-blur-xl border-b border-geo-border/60 py-3 shadow-geo-card'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3.5 text-left group transition-transform focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-geo-surface/80 border border-geo-border/60 flex items-center justify-center text-geo-cyan group-hover:border-geo-cyan/50 transition-all duration-300 shadow-sm group-hover:shadow-geo-glow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-base tracking-tight text-geo-text group-hover:text-white transition-colors">
                DepthWizard
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-geo-surface/80 text-geo-cyan border border-geo-border/60">
                SIH 2026 • PS 26175
              </span>
            </div>
            <p className="text-[11px] text-geo-muted hidden md:block">
              Single-View Height Estimation & 3D Flythrough
            </p>
          </div>
        </button>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-geo-surface/60 border border-geo-border/50 px-2 py-1.5 rounded-full backdrop-blur-xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                activeNav === link.id
                  ? link.id === 'demo-workspace'
                    ? 'bg-geo-cyan/15 text-geo-cyan border border-geo-cyan/25 shadow-sm'
                    : 'bg-geo-elevated/80 text-geo-text shadow-sm'
                  : 'text-geo-muted hover:text-geo-text'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2">
            <StatusBadge status={status} size="sm" />
          </div>

          <button
            onClick={() => scrollToSection('demo-workspace')}
            className="btn-shimmer flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-medium bg-geo-cyan text-geo-bg hover:bg-cyan-400 font-mono transition-all duration-300 shadow-sm hover:shadow-geo-glow hover:-translate-y-0.5"
          >
            <span>Launch Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2.5 rounded-xl text-geo-muted hover:text-white bg-geo-surface/80 border border-geo-border/60 lg:hidden transition-all duration-200"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-geo-bg-alt/95 border-b border-geo-border/60 px-6 py-5 space-y-3 backdrop-blur-xl">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  link.id === 'demo-workspace'
                    ? 'font-medium text-geo-cyan hover:bg-geo-surface/80 flex items-center justify-between'
                    : 'text-geo-text hover:bg-geo-surface/80'
                }`}
              >
                <span>{link.id === 'demo-workspace' ? 'Demo Workspace' : link.label}</span>
                {link.id === 'demo-workspace' && <ArrowRight className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-geo-border/40 flex items-center justify-between">
            <span className="text-xs text-geo-muted font-mono">System:</span>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};
