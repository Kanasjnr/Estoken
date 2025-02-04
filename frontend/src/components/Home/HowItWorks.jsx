import { motion } from 'framer-motion'
import { Search, DollarSign, TrendingUp, RefreshCw } from 'react-feather'

const steps = [
  {
    icon: Search,
    title: "Browse Properties",
    description: "Explore our curated list of tokenized real estate opportunities"
  },
  {
    icon: DollarSign,
    title: "Invest",
    description: "Purchase tokens representing fractional ownership in properties"
  },
  {
    icon: TrendingUp,
    title: "Earn & Grow",
    description: "Receive rental income and benefit from property value appreciation"
  },
  {
    icon: RefreshCw,
    title: "Trade",
    description: "Buy or sell property tokens on our secondary marketplace"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          How It Works
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <motion.div 
                className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <step.icon className="w-10 h-10" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

