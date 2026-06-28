import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export const LandingPage = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-element').forEach((el) => {
      observer.observe(el);
    });

    setTimeout(() => {
      document.querySelectorAll('.reveal-element:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col flex-grow w-full antialiased text-[#111111] bg-[#faf9f9]">
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1; }

        .reveal-element {
            opacity: 0;
            transform: translateY(16px);
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-element.visible {
            opacity: 1;
            transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
            .reveal-element {
                transition: none;
                opacity: 1;
                transform: none;
            }
        }
      `}</style>
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-gutter py-24 md:py-32 flex flex-col items-center text-center reveal-element">
        <h1 className="font-headline-xl text-headline-xl text-text-primary max-w-4xl mb-6">
          Streamline your operations with Nexus.
        </h1>
        <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl mb-10">
          We built Nexus to solve the complexity of modern workflows, giving your team back the time they need to focus on what actually matters. Reliable, fast, and engineered for scale.
        </p>
        <div className="flex justify-center w-full sm:w-auto">
          <Link
            to="/onboarding"
            className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-3 rounded border border-transparent hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out w-full sm:w-auto text-center"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="platform" className="bg-surface-subtle border-y border-border-low-contrast w-full">
        <div className="max-w-container-max mx-auto px-gutter py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default">
              <span className="material-symbols-outlined icon-fill text-primary text-3xl mb-4 block">
                sync
              </span>
              <h3 className="font-headline-md text-headline-md text-text-primary mb-3">
                Real-time Sync
              </h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Data flows instantly across all your connected tools. No manual refreshes, no stale information. Just one unified truth for your entire organization.
              </p>
            </div>
            <div
              className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default"
              style={{ transitionDelay: '100ms' }}
            >
              <span className="material-symbols-outlined icon-fill text-primary text-3xl mb-4 block">
                smart_toy
              </span>
              <h3 className="font-headline-md text-headline-md text-text-primary mb-3">
                Intelligent Automation
              </h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Define rules once and let Nexus handle the repetitive tasks. Our engine executes complex multi-step workflows dependably, every single time.
              </p>
            </div>
            <div
              className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default"
              style={{ transitionDelay: '200ms' }}
            >
              <span className="material-symbols-outlined icon-fill text-primary text-3xl mb-4 block">
                shield_lock
              </span>
              <h3 className="font-headline-md text-headline-md text-text-primary mb-3">
                Secure Architecture
              </h3>
              <p className="font-body-md text-body-md text-text-secondary">
                Built on a foundation of enterprise-grade security. Your data is encrypted at rest and in transit, with granular access controls standard on all plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Nexus Way Section */}
      <section className="max-w-container-max mx-auto px-gutter py-24 reveal-element w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-6">
              The Nexus Way: Engineered for velocity.
            </h2>
            <p className="font-body-lg text-body-lg text-text-secondary mb-6">
              We don't believe in unnecessary complexity. The best tools are the ones that get out of your way. Nexus is designed with a relentless focus on performance and reliability.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  check_circle
                </span>
                <div>
                  <strong className="font-label-md text-label-md text-text-primary block">
                    Zero-latency interface
                  </strong>
                  <span className="font-body-sm text-body-sm text-text-secondary">
                    Optimized rendering ensures every interaction feels immediate.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  check_circle
                </span>
                <div>
                  <strong className="font-label-md text-label-md text-text-primary block">
                    Predictable pricing
                  </strong>
                  <span className="font-body-sm text-body-sm text-text-secondary">
                    No hidden fees or complex usage tiers. Simple, straightforward billing.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-1">
                  check_circle
                </span>
                <div>
                  <strong className="font-label-md text-label-md text-text-primary block">
                    Expert support
                  </strong>
                  <span className="font-body-sm text-body-sm text-text-secondary">
                    Direct access to engineers who actually built the product.
                  </span>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-surface-subtle border border-border-low-contrast rounded-lg h-96 flex items-center justify-center p-8 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-lg">
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply transition-transform duration-700 ease-out hover:scale-105"
              alt="A clean, abstract architectural visualization of data flow."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKUl68JYoY4w95JNYEKFJ_En3-PRrZItSUHnOOUEKLCRa4nb4kuEjava7WrEqipKHpwp_2hBwfZWzSlUHa5fh7XVGlKF-6PxU9Z72tButUbjhk1uEfGQF9OVjwZq2IuD7p4-QJUSMbEliAcX9rgtCeFV3c1aCfUZYCwZTTsKO__WFhPuH6GWmT_J-D6nuoZdaZqSCRKynqBXAChzNHdRHPuOsFV2POvJ8IZZ6g1zFmbGw4xr9s8X-RjQoyp8wAoSRZA5MyssZzg_4"
            />
          </div>
        </div>
      </section>

      {/* Recruiter Reviews Section */}
      <section id="reviews" className="bg-surface-subtle border-y border-border-low-contrast py-20 reveal-element w-full">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-4">
              What talent teams are saying
            </h2>
            <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl mx-auto">
              We're changing the way top recruiters evaluate and route engineering talent.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">
                  PS
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-text-primary">Priya Sharma</h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">Lead Tech Recruiter</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary flex-grow leading-relaxed">
                "Honestly, Nexus changed how we hire. I used to spend hours digging through GitHub trying to figure out if a candidate was actually good or just had a nice resume. Now, I have a clear, objective map of their skills before I even schedule a call. It's saved us so much time."
              </p>
            </div>
            
            {/* Review 2 */}
            <div
              className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default flex flex-col h-full"
              style={{ transitionDelay: '100ms' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-lg">
                  RD
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-text-primary">Rahul Desai</h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">Talent Acquisition Manager</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary flex-grow leading-relaxed">
                "The gap analysis feature is a lifesaver. It completely eliminates the guesswork. I can confidently tell engineering managers exactly where a candidate fits, and we've cut our interview rounds down from four to two. Candidates love the faster process, too."
              </p>
            </div>
            
            {/* Review 3 */}
            <div
              className="bg-surface-base p-8 border border-border-low-contrast rounded-lg reveal-element transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant cursor-default flex flex-col h-full"
              style={{ transitionDelay: '200ms' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg">
                  AG
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-text-primary">Ananya Gupta</h4>
                  <p className="font-body-sm text-body-sm text-text-secondary">VP of HR</p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-text-secondary flex-grow leading-relaxed">
                "What I love most is the total lack of bias. By routing candidates based strictly on cryptographic skill validation, we're building a more diverse and capable team organically. It's the first tool I've seen that actually delivers on the promise of merit-based hiring."
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-16">
            <Link
              to="/onboarding"
              className="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-3 rounded border border-transparent hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm transition-all duration-200 ease-out"
            >
              Start for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
