import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const terms = [
  {
    term: 'Leverage',
    definition: 'The use of borrowed capital to invest in a financial instrument or asset. It can amplify both profits and losses.'
  },
  {
    term: 'Margin Call',
    definition: 'A demand from a broker for an investor to deposit further cash or securities to cover losses in a leveraged position. It occurs when the account equity falls below a certain level.'
  },
  {
    term: 'Theta',
    definition: 'A measure of the rate of decline in the value of an option due to the passage of time. It is also known as time decay.'
  },
  {
    term: 'Delta',
    definition: 'A ratio that compares the change in the price of an asset, usually a security, to the corresponding change in the price of its derivative.'
  },
  {
    term: 'Gamma',
    definition: 'The rate of change in an option\'s delta per one-point move in the underlying asset\'s price. It is an important measure of the convexity of an option\'s value.'
  },
  {
    term: 'Vega',
    definition: 'A measure of an option\'s sensitivity to changes in the volatility of the underlying asset. It represents the amount that an option contract\'s price changes in reaction to a 1% change in the implied volatility of the underlying asset.'
  },
  {
    term: 'Bull Market',
    definition: 'A financial market of a group of securities in which prices are rising or are expected to rise. The term is most often used to refer to the stock market but can be applied to anything that is traded, such as bonds, currencies, and commodities.'
  },
  {
    term: 'Bear Market',
    definition: 'A financial market of a group of securities in which prices are falling or are expected to fall. The term is most often used to refer to the stock market but can be applied to anything that is traded, such as bonds, currencies, and commodities.'
  },
];

const GlossarySidebar = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = useMemo(() => {
    return terms.filter(item =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
          />
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900/80 border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Trading Glossary</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 mb-6 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="overflow-y-auto flex-grow pr-4 -mr-4">
              <ul className="space-y-4">
                {filteredTerms.map(item => (
                  <li key={item.term} className="border-b border-slate-800 pb-2">
                    <h3 className="font-semibold text-lg text-blue-400">{item.term}</h3>
                    <p className="text-sm text-slate-300">{item.definition}</p>
                  </li>
                ))}
              </ul>
              {filteredTerms.length === 0 && (
                <p className="text-slate-500 text-center mt-4">No terms found for '{searchTerm}'.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlossarySidebar;