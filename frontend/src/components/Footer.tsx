import { Link } from 'react-router-dom';
import '../index.css';

export const Footer = () => {
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
    <footer className="bg-surface-subtle dark:bg-surface-container-highest w-full py-unit-12 border-t border-border-low-contrast dark:border-outline-variant flat no shadows mt-auto">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-2 md:grid-cols-4 gap-unit-8">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <span className="font-headline-sm text-headline-sm font-bold text-text-primary dark:text-inverse-on-surface">Nexus</span>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label-sm text-label-sm text-text-primary uppercase tracking-wider mb-2">Product</h4>
          <Link to="/#platform" onClick={(e) => handleAnchorClick(e, 'platform')} className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Platform</Link>
          <Link to="/#reviews" onClick={(e) => handleAnchorClick(e, 'reviews')} className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Reviews</Link>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label-sm text-label-sm text-text-primary uppercase tracking-wider mb-2">Company</h4>
          <Link to="/" className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">About</Link>
          <Link to="/" className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Careers</Link>
          <Link to="/" className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Contact</Link>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-label-sm text-label-sm text-text-primary uppercase tracking-wider mb-2">Legal</h4>
          <Link to="/privacy" className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Privacy</Link>
          <Link to="/terms" className="font-body-sm text-body-sm text-text-secondary dark:text-on-secondary-fixed-variant hover:text-primary dark:hover:text-primary-fixed-dim underline underline-offset-4 transition-colors duration-200 ease-out">Terms</Link>
        </div>
      </div>
    </footer>
  );
};
