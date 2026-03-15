'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Compass, Target, Globe, Menu, X, Github, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const handleScroll = () => {
      // Throttled scroll check for performance
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const savedLang = localStorage.getItem('appLang') || 'en';
    setCurrentLang(savedLang);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLangChange = (code: string) => {
    setCurrentLang(code);
    localStorage.setItem('appLang', code);
    window.dispatchEvent(new Event('storage')); 
    window.location.reload(); 
  };

  const navLinks = [
    { name: 'Analyze', href: '/analyze', icon: Search },
    { name: 'Guide', href: '/guide', icon: Target },
    { name: 'Discover', href: '/discover', icon: Compass },
  ];

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hardware-accelerated ${
      isScrolled ? 'py-3 bg-slate-950/80 backdrop-blur-md border-b border-white/10' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform hardware-accelerated">
              <Github className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              ContriboScope
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : ''}`} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>{activeLang.flag} {activeLang.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300 w-40 backdrop-blur-xl">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="flex items-center justify-between cursor-pointer focus:bg-blue-600 focus:text-white"
                    onClick={() => handleLangChange(lang.code)}
                  >
                    <span>{lang.label}</span>
                    <span>{lang.flag}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                     <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{session.user?.name?.split(' ')[0]}</span>
                     <div className="w-8 h-8 rounded-full border border-blue-500/50 overflow-hidden">
                        {session.user?.image ? (
                          <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                     </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-slate-300 backdrop-blur-xl">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="cursor-pointer focus:bg-white/5">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer focus:bg-red-600 focus:text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => signIn("github", { prompt: "login" })}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-medium text-slate-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
               <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm">Language</span>
                  <select 
                    value={currentLang} 
                    onChange={(e) => handleLangChange(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                    ))}
                  </select>
               </div>
               
               {status === "authenticated" ? (
                 <Button variant="outline" onClick={() => signOut()} className="w-full border-white/10 text-white">
                   Sign Out ({session.user?.name})
                 </Button>
               ) : (
                 <Button onClick={() => signIn("github", { prompt: "login" })} className="w-full bg-blue-600">Sign In</Button>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
