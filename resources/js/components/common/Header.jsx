import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLocation as useRouteLocation } from 'react-router-dom';
import { useLocation as useLocationHook } from '../../hooks/useLocation.jsx';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useLocationHook(); // keep existing behaviour (scroll to hash etc.)
  const routeLocation = useRouteLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Accueil', link: '/' },
    { name: 'Missions', link: '/offers' },
    { name: 'F.A.Q', link: '/faq' },
    { name: 'Contact', link: '/contact' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [routeLocation.pathname]);

  // Ensure header is visible (dark text / white background) on non-home pages
  useEffect(() => {
    if (routeLocation.pathname === '/') {
      // on home, keep original behavior (transparent until scrolled)
      setScrolled(window.scrollY > 10);
    } else {
      // on other pages show the solid header so links are readable
      setScrolled(true);
    }
  }, [routeLocation.pathname]);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4 md:py-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${scrolled ? 'bg-indigo-600' : 'bg-white'}`}>
                <span className={`font-bold ${scrolled ? 'text-white' : 'text-indigo-600'}`}>G</span>
              </div>
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>GainExpress</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} className={`py-2 px-4 ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                <Link to={item.link}>{item.name}</Link>
              </motion.div>
            ))}
          </nav>

          <button className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {menuItems.map((item, index) => (
              <div key={index} className="py-2 border-b border-gray-100">
                <Link to={item.link} className="block text-gray-700 hover:text-indigo-600" onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
