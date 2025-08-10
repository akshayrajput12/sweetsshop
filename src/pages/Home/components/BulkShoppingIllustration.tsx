import React from 'react';
import { motion } from 'framer-motion';

const BulkShoppingIllustration = () => {
  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 rounded-3xl overflow-hidden shadow-2xl border border-orange-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full max-h-full">
          {/* Shopping Cart */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <rect x="150" y="200" width="100" height="80" rx="10" fill="#f97316" opacity="0.9"/>
            <rect x="160" y="210" width="80" height="60" rx="5" fill="#ffffff" opacity="0.9"/>
            <circle cx="170" cy="290" r="8" fill="#374151"/>
            <circle cx="230" cy="290" r="8" fill="#374151"/>
            <path d="M140 180 L160 180 L160 200 L250 200 L250 180 L270 180" stroke="#374151" strokeWidth="3" fill="none"/>
          </motion.g>

          {/* Products around cart */}
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Grocery Box 1 */}
            <rect x="80" y="150" width="40" height="40" rx="5" fill="#10b981" opacity="0.8"/>
            <rect x="85" y="155" width="30" height="30" rx="3" fill="#ffffff" opacity="0.9"/>
            <text x="100" y="175" textAnchor="middle" fontSize="20" fill="#10b981">🍎</text>
          </motion.g>

          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Grocery Box 2 */}
            <rect x="280" y="160" width="40" height="40" rx="5" fill="#3b82f6" opacity="0.8"/>
            <rect x="285" y="165" width="30" height="30" rx="3" fill="#ffffff" opacity="0.9"/>
            <text x="300" y="185" textAnchor="middle" fontSize="20" fill="#3b82f6">📦</text>
          </motion.g>

          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Grocery Box 3 */}
            <rect x="120" y="100" width="40" height="40" rx="5" fill="#f59e0b" opacity="0.8"/>
            <rect x="125" y="105" width="30" height="30" rx="3" fill="#ffffff" opacity="0.9"/>
            <text x="140" y="125" textAnchor="middle" fontSize="20" fill="#f59e0b">☕</text>
          </motion.g>

          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {/* Grocery Box 4 */}
            <rect x="240" y="110" width="40" height="40" rx="5" fill="#8b5cf6" opacity="0.8"/>
            <rect x="245" y="115" width="30" height="30" rx="3" fill="#ffffff" opacity="0.9"/>
            <text x="260" y="135" textAnchor="middle" fontSize="20" fill="#8b5cf6">🏠</text>
          </motion.g>

          {/* Floating Elements */}
          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="100" cy="80" r="15" fill="#fbbf24" opacity="0.7"/>
            <text x="100" y="85" textAnchor="middle" fontSize="16" fill="#ffffff">%</text>
          </motion.g>

          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <circle cx="320" cy="90" r="15" fill="#ef4444" opacity="0.7"/>
            <text x="320" y="95" textAnchor="middle" fontSize="16" fill="#ffffff">🚚</text>
          </motion.g>

          {/* Savings Badge */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <ellipse cx="200" cy="320" rx="60" ry="25" fill="#10b981" opacity="0.9"/>
            <text x="200" y="315" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">SAVE UP TO</text>
            <text x="200" y="330" textAnchor="middle" fontSize="16" fill="#ffffff" fontWeight="bold">50% OFF</text>
          </motion.g>

          {/* Decorative Lines */}
          <motion.g
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <path d="M50 200 Q100 180 150 200" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="5,5"/>
            <path d="M250 200 Q300 180 350 200" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" strokeDasharray="5,5"/>
          </motion.g>
        </svg>
      </div>

      {/* Quality Badge */}
      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-semibold text-gray-800">Premium Quality</span>
        </div>
      </div>

      {/* Bulk Shopping Badge */}
      <div className="absolute bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
        <div className="flex items-center space-x-2">
          <span>📦</span>
          <span className="text-sm font-semibold">Bulk Shopping</span>
        </div>
      </div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-16 right-16 w-3 h-3 bg-orange-400 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-16 w-4 h-4 bg-yellow-400 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-32 left-20 w-2 h-2 bg-red-400 rounded-full"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </div>
  );
};

export default BulkShoppingIllustration;