import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header.jsx';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now we'll just show a confirmation. Integrate API endpoint to send messages.
    setSubmitted(true);
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: form */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-gray-600 mb-6">Une question ? Un partenariat ? Écrivez-nous et nous revenons vers vous sous 48h.</p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nom</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Votre nom" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="votre@email.com" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} className="input-field" rows="6" placeholder="Votre message..."></textarea>
              </div>

              <div className="flex items-center space-x-4">
                <button type="submit" className="btn-primary">Envoyer</button>
                <p className="text-sm text-gray-500">Nous répondons généralement sous 48 heures.</p>
              </div>
            </form>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-2">Merci !</h2>
              <p className="text-gray-600">Votre message a bien été envoyé. Nous reviendrons vers vous rapidement.</p>
            </div>
          )}
        </div>

        {/* Right: image + info */}
        <div className="text-center md:text-left">
          <div className="overflow-hidden rounded-xl shadow-md mb-6">
            <img src="https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" alt="Contact" className="w-full h-64 object-cover" />
          </div>

          <h3 className="text-xl font-semibold mb-2">Nos coordonnées</h3>
          <p className="text-gray-600 mb-4">123 Rue Example, Paris<br/>contact@gainexpress.example</p>

          <h3 className="text-xl font-semibold mb-2">Horaires</h3>
          <p className="text-gray-600">Lundi - Vendredi: 9h - 18h</p>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-800">Facebook</a>
              <a href="#" className="text-gray-500 hover:text-gray-800">Twitter</a>
              <a href="#" className="text-gray-500 hover:text-gray-800">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;
