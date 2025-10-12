
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header.jsx';


const LandingPage = () => {
    // États pour gérer l'animation de typing
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
    const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // header component handles scroll/hash behaviour via its own hook



    // Textes à afficher avec l'effet typing
  const texts = ['Gagnez de l\'argent en', 'ligne avec Gains', 'Gains Exprex'];

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
      link: '/faq'
    },
    {
      name: 'Contact',
      link: '/contact'
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


      {/* Use the shared header component for consistent navigation */}
      <Header />
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
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:-translate-y-1 text-center">
              Connexion
            </a>
            <a
    href="/register"  className="bg-transparent hover:bg-white text-white hover:text-gray-800 font-bold py-3 px-8 border-2 border-white rounded-full transition duration-300 text-center">
              S'inscrire
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Services Section (Daisycon editor: missions rémunérées) */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Missions</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">Choisissez les campagnes, suivez les conversions et percevez vos gains en toute transparence.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mission Card 1 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <i className="fas fa-hand-holding-usd text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Missions payantes</h3>
              <p className="text-gray-600">Chaque action validée génère une commission claire et traçable.</p>
            </div>

            {/* Mission Card 2 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <i className="fas fa-chart-bar text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Campagnes</h3>
              <p className="text-gray-600">Accédez directement aux participations : filtrez par status et vos revenus.</p>
            </div>

            {/* Mission Card 3 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <i className="fas fa-tachometer-alt text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Suivi & reporting</h3>
              <p className="text-gray-600">Consultez vos rapports et optimisez vos participations.</p>
            </div>

            {/* Mission Card 4 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <i className="fas fa-wallet text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Paiements & support</h3>
              <p className="text-gray-600">Notre équipe vous accompagne pour l'intégration, et l'optimisation de vos revenus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section (éditeur / plateforme de missions) */}
      <section className="py-20 bg-white" id="about">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                   alt="Notre équipe" className="rounded-xl shadow-xl w-full" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-4xl font-bold mb-6">Pourquoi nous choisir ?</h2>
              <p className="text-lg text-gray-700 mb-6">Nous aidons les éditeurs à monétiser leur audience en proposant des missions simples à accomplir pour vos visiteurs. Notre plateforme centralise la gestion des campagnes, le suivi des performances et les paiements — vous vous concentrez sur l'audience, nous optimisons vos revenus.</p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-rocket text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Monétisation facile</h3>
                    <p className="text-gray-600">Proposez rapidement des missions adaptées à votre audience et commencez à générer des revenus sans effort technique.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-chart-line text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Suivi et optimisation</h3>
                    <p className="text-gray-600">Tableau de bord clair pour analyser les performances, identifier les meilleures campagnes et optimiser vos revenus.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-600 rounded-full p-2 mr-4">
                    <i className="fas fa-shield-alt text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Paiements & conformité</h3>
                    <p className="text-gray-600">Paiements fiables et reporting transparent — nous garantissons la conformité des campagnes et la sécurité des transactions.</p>
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
                  <p className="text-gray-600">Blogueuse</p>
                </div>
              </div>
              <p className="text-gray-700">"Grâce à GainsExpress, j’ai pu monétiser mon blog sans effort supplémentaire."</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/men/76.jpg" alt="Client" />
                </div>
                <div>
                  <h3 className="font-semibold">Ahmed Ben</h3>
                  <p className="text-gray-600">Éditeur</p>
                </div>
              </div>
              <p className="text-gray-700">"Grâce à GainsExpress, j’ai pu monétiser mon blog sans effort supplémentaire."</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 transition transform hover:scale-105">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4">
                  <img src="https://randomuser.me/api/portraits/women/12.jpg" alt="Client" />
                </div>
                <div>
                  <h3 className="font-semibold">Claire Petit</h3>
                  <p className="text-gray-600">Influenceuse</p>
                </div>
              </div>
              <p className="text-gray-700">"Grâce à GainsExpress, j’ai pu monétiser mon blog sans effort supplémentaire."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white" id="cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre vision en réalité ?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment nous pouvons vous aider à atteindre vos objectifs.</p>
          <Link to="/register" className="bg-white text-indigo-600 font-bold py-4 px-10 rounded-full transition duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center inline-block">
            Inscrivez-vous dès maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Gains Express</h3>
              <p className="text-gray-400">Nous vous fournissons les outils, les campagnes et le support pour maximiser vos revenus.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-400 hover:text-white transition">Services</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition">À propos</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition">Témoignages</a></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition">F.A.Q</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Missions payantes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Campagnes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Suivi & reporting</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Paiements & support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4"></h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400"><i className="fas fa-map-marker-alt mr-3"></i> </li>
                <li className="flex items-center text-gray-400"><i className="fas fa-phone mr-3"></i> </li>
                <li className="flex items-center text-gray-400"><i className="fas fa-envelope mr-3"></i> </li>
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
