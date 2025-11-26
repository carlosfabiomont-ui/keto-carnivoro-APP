import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-6xl mx-auto text-center py-4 mt-8 border-t border-brand-gray">
      <p className="text-sm text-brand-gray-light">
        © {new Date().getFullYear()} Keto Carnivora AI. Todos os direitos reservados.
      </p>
    </footer>
  );
};

export default Footer;