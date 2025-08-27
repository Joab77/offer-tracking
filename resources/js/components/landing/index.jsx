
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


const LandingPage = () => {
    // États pour gérer l'animation de typing
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
    const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  // Textes à afficher avec l'effet typing  
  const texts = ['Gagnez de l\'argent en', 'ligne avec Gain', 'Gains Exprex'];

  // Détection du scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Données du menu
  const menuItems = [
    {
      name: 'Accueil',
      link: '/'
    },
    {
      name: 'Missions',
      link: '#missions',
      submenu: [
        { name: 'Décrocher une mission', 
        link: '/register',
        className: 'whitespace-nowrap' 
 },
    
      ]
    },
    {
      name: 'F.A.Q',
      link: '#faq'
    },
    {
      name: 'Contact',
      link: '#contact'
    }
  ];

  // Effet pour gérer l'animation de typing
  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % texts.length;
      const fullText = texts[i];
      
      setText(isDeleting 
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      );
      
      setTypingSpeed(isDeleting ? 75 : 150);
      
      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);
  return (
    <div className="font-sans antialiased text-gray-800">


         {/* Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-8">
            {/* Logo */}
            <div className="flex items-center pl-4">
             <a href="/" className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${scrolled ? 'bg-indigo-600' : 'bg-white'}`}>
                <span className={`font-bold ${scrolled ? 'text-white' : 'text-indigo-600'}`}>G</span>
                </div>
                <span className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>GainsExprex</span>
            </a>
             </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex space-x-8 pr-4">
              {menuItems.map((item, index) => (
                <div key={index} className="relative group">


                    <motion.a 
                    href={item.link}
                    whileHover={{ 
                        scale: 1.05,
                        color: '#6366F1',
                        transition: { duration: 0.3 }
                    }}
                    className={`py-2 px-4 ${scrolled ? 'text-gray-700' : 'text-white'}`}
                    >
                    {item.name}
                    </motion.a>
               
                  {/* Sous-menu */}
                  {item.submenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <a 
                          key={subIndex} 
                          href={subItem.link} 
                          className={`block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition duration-300 ${subItem.className || ''}`}
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Bouton mobile */}
            <button 
              className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              {menuItems.map((item, index) => (
                <div key={index} className="py-2 border-b border-gray-100">
                  <a 
                    href={item.link} 
                    className="block text-gray-700 hover:text-indigo-600 transition duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                  
                  {/* Sous-menu mobile */}
                  {item.submenu && (
                    <div className="pl-4 mt-2">
                      {item.submenu.map((subItem, subIndex) => (
                        <a 
                          key={subIndex} 
                          href={subItem.link} 
                          className="block py-2 text-gray-600 hover:text-indigo-600 transition duration-300"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* Hero Section */}
       
     {/* Hero Section avec animation typing */}
      <section className="relative min-h-screen flex items-center justify-center py-16" id="hero">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <div className="h-24 md:h-28 mb-6 flex justify-center items-center">
            <h1 className="text-4xl md:text-5xl font-bold">
              {text}
              <span className="ml-1 inline-block w-0.5 h-12 bg-white animate-pulse"></span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Transformez votre audience en revenus avec une plateforme parfaitement calibrée</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/register"  
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:-translate-y-1 text-center">
              Commencer
            </a>
            <a 
    href="#services"  className="bg-transparent hover:bg-white text-white hover:text-gray-800 font-bold py-3 px-8 border-2 border-white rounded-full transition duration-300 text-center">
              En savoir plus
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Nos Services</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">Découvrez notre gamme complète de services conçus pour propulser votre entreprise vers l'avant</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Card 1 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <i className="fas fa-laptop-code text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Développement Web</h3>
              <p className="text-gray-600">Des sites web modernes, réactifs et entièrement personnalisés pour répondre à vos besoins spécifiques.</p>
            </div>
            
            {/* Service Card 2 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <i className="fas fa-mobile-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Applications Mobiles</h3>
              <p className="text-gray-600">Applications iOS et Android intuitives et performantes qui engagent vos utilisateurs.</p>
            </div>
            
            {/* Service Card 3 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Marketing Digital</h3>
              <p className="text-gray-600">Stratégies de marketing digital sur mesure pour accroître votre visibilité en ligne.</p>
            </div>
            
            {/* Service Card 4 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <i className="fas fa-cloud text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Solutions Cloud</h3>
              <p className="text-gray-600">Des solutions cloud sécurisées et évolutives pour soutenir la croissance de votre entreprise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white" id="about">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                   alt="Notre équipe" className="rounded-xl shadow-xl w-full" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-4xl font-bold mb-6">Pourquoi nous choisir ?</h2>
              <p className="text-lg text-gray-700 mb-6">Chez nous, l'innovation et l'excellence sont au cœur de tout ce que nous faisons. Notre équipe d'experts passionnés travaille sans relâche pour délivrer des solutions qui dépassent les attentes.</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Expertise technique de pointe</h3>
                    <p className="text-gray-600">Notre équipe maîtrise les dernières technologies et frameworks.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Support personnalisé</h3>
                    <p className="text-gray-600">Nous vous accompagnons à chaque étape de votre projet.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Livraison dans les délais</h3>
                    <p className="text-gray-600">Nous respectons scrupuleusement les échéances convenues.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100" id="testimonials">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Ce que disent nos clients</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">Découvrez les témoignages de ceux qui nous ont fait confiance</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/women/43.jpg" alt="Client" />
                </div>
                <div>
                  <h3 className="font-semibold">Marie Dubois</h3>
                  <p className="text-gray-600">CEO, InnovTech</p>
                </div>
              </div>
              <p className="text-gray-700">"Leur équipe a transformé notre présence en ligne. Notre trafic a augmenté de 150% en seulement 3 mois !"</p>
              <div className="mt-4 text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client" />
                </div>
                <div>
                  <h3 className="font-semibold">Thomas Martin</h3>
                  <p className="text-gray-600">Directeur Marketing</p>
                </div>
              </div>
              <p className="text-gray-700">"Le site web qu'ils ont créé pour nous est non seulement magnifique mais aussi incroyablement fonctionnel."</p>
              <div className="mt-4 text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Client" />
                </div>
                <div>
                  <h3 className="font-semibold">Sophie Leroux</h3>
                  <p className="text-gray-600">Entrepreneure</p>
                </div>
              </div>
              <p className="text-gray-700">"Leur approche personnalisée et leur réactivité ont fait toute la différence pour mon projet."</p>
              <div className="mt-4 text-yellow-400">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white" id="cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre vision en réalité ?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment nous pouvons vous aider à atteindre vos objectifs.</p>
          <button className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-full transition duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            Nous contacter
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Notre Société</h3>
              <p className="text-gray-400">Nous créons des solutions digitales innovantes qui aident les entreprises à prospérer à l'ère numérique.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li><a href="#hero" className="text-gray-400 hover:text-white transition">Accueil</a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition">À propos</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition">Témoignages</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Développement Web</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Applications Mobiles</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Marketing Digital</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Solutions Cloud</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400"><i className="fas fa-map-marker-alt mr-3"></i> 123 Rue Example, Paris</li>
                <li className="flex items-center text-gray-400"><i className="fas fa-phone mr-3"></i> +33 1 23 45 67 89</li>
                <li className="flex items-center text-gray-400"><i className="fas fa-envelope mr-3"></i> contact@example.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 Votre Société. Tous droits réservés.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;