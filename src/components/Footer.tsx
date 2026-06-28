import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  // const { t } = useTranslation('footer');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Get Exclusive Deals</h3>
              <p className="text-white/90">
                Subscribe to our newsletter for early access to new experiences and exclusive discounts.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-white text-sm">✓ Thanks for subscribing!</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-black text-orange-400">🌍</span>
              <span className="text-2xl font-bold">Midzoe</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Transform your dreams into unforgettable experiences. Global travel, reimagined.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.6 11.5h-2.1v6.6h-2.2v-6.6H9.9v-2h1.4V7.7c0-1.164.573-2.987 2.987-2.987h1.846v1.98h-1.337c-.226 0-.536.113-.536.6v1.237h1.9l-.264 2h-1.636v6.6z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75-9.75-4.365-9.75-9.75 4.365-9.75 9.75-9.75zm0 1.5c-4.56 0-8.25 3.69-8.25 8.25s3.69 8.25 8.25 8.25 8.25-3.69 8.25-8.25-3.69-8.25-8.25-8.25zm3.75 9.75h-7.5v-1.5h7.5v1.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Midzoe */}
          <div>
            <h4 className="font-semibold mb-6">Midzoe</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition">Services</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Tourism */}
          <div>
            <h4 className="font-semibold mb-6">Tourism</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/tourism" className="text-gray-400 hover:text-white transition">Experiences</Link></li>
              <li><Link to="/services/tourist-sites" className="text-gray-400 hover:text-white transition">Trip Builder</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              <li><Link to="/tourism" className="text-gray-400 hover:text-white transition">Guides</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Deals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition">Safety</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Accessibility</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy</Link></li>
            </ul>
          </div>

          {/* Trust Signals */}
          <div>
            <h4 className="font-semibold mb-6">Certified</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span>✓</span>
                <span className="text-gray-400">50K+ Travelers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>✓</span>
                <span className="text-gray-400">4.9★ Rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>✓</span>
                <span className="text-gray-400">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>✓</span>
                <span className="text-gray-400">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>✓</span>
                <span className="text-gray-400">Travel Insurance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Midzoe. All rights reserved. | Made with 🌍 for travelers
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm">
            <span className="text-gray-400">🔒 SSL Secure</span>
            <span className="text-gray-400">💳 PCI Compliant</span>
            <span className="text-gray-400">🌍 GDPR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
