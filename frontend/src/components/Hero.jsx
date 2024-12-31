import { motion } from 'framer-motion'
import { Button } from './Button'

export function Hero() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative h-screen flex items-center justify-center text-white overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/luxury-estate.jpg')",
          filter: "brightness(0.4)"
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70 z-10"></div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <svg className="w-64 h-64 md:w-96 md:h-96" viewBox="0 0 200 200">
          <motion.path
            d="M100,10 L190,50 L190,150 L100,190 L10,150 L10,50 Z"
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
      
      <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
        >
          Revolutionize Real Estate Investment
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl mb-8 text-gray-300"
        >
          Fractional ownership made easy through blockchain tokenization
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button variant="primary">Explore Properties</Button>
          <Button variant="secondary">Learn More</Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
      >
        <svg 
          className="w-6 h-6 text-white animate-bounce" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </motion.div>
    </motion.section>
  )
}

