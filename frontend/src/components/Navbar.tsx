import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../index.css';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        const y = element.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  return (
    <nav
      className={`bg-surface-base dark:bg-inverse-surface w-full sticky top-0 z-50 border-b border-border-low-contrast dark:border-outline-variant flat no shadows transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm border-transparent dark:bg-[#303031]/85'
          : ''
      }`}
      id="main-nav"
    >
      <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto">
        <div className="flex items-center gap-unit-8">
          <Link
            to="/"
            className="font-headline-sm text-headline-sm font-bold text-text-primary dark:text-inverse-on-surface"
          >
            Nexus
          </Link>
          <div className="hidden md:flex gap-unit-8">
            <Link
              to="/#platform"
              onClick={(e) => handleAnchorClick(e, 'platform')}
              className="font-body-md text-body-md text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors duration-200 ease-out"
            >
              Platform
            </Link>
            <Link
              to="/#reviews"
              onClick={(e) => handleAnchorClick(e, 'reviews')}
              className="font-body-md text-body-md text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors duration-200 ease-out"
            >
              Reviews
            </Link>
            <Link
              to="/hr-dashboard"
              className="font-body-md text-body-md text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim transition-colors duration-200 ease-out"
            >
              HR Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <Link
            to="/onboarding"
            className="bg-primary-container text-on-primary-container font-label-md text-label-md px-4 py-2 rounded border border-transparent hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
