import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/common/Header.jsx';

const Faq = () => {
  const faqs = [
    {
      q: "Comment puis-je commencer à proposer des missions ?",
      a: "Inscrivez-vous, accédez à votre tableau de bord et sélectionnez les campagnes adaptées à votre audience. Aucune compétence technique n'est requise."
    },
    {
      q: "Comment suis-je payé ?",
      a: "Les paiements sont traités via notre système partenaire. Vous pouvez consulter l'historique des paiements." 
    },
    {
      q: "Puis-je filtrer",
      a: "Oui. Utilisez les filtres disponibles dans la section 'Missions' pour choisir les missions." 
    },
    {
      q: "Y a-t-il une vérification avant que les gains soient validés ?",
      a: "Oui. Les Missions passent par un processus de validation automatique et parfois manuelle. Les participations apparaîtront dans votre tableau de bord une fois validés." 
    }
  ];

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-20">

      <h1 className="text-3xl font-bold mb-6">F.A.Q</h1>
      <div className="space-y-6">
        {faqs.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{item.q}</h3>
            <p className="text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Faq;
