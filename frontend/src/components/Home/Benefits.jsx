import { motion } from 'framer-motion'
import { DollarSign, PieChart, Zap, Lock } from 'react-feather'

const benefits = [
  {
    icon: DollarSign,
    title: "Low Entry Barrier",
    description: "Invest in high-value properties with minimal capital, starting from as low as $100"
  },
  {
    icon: PieChart,
    title: "Portfolio Diversification",
    description: "Spread your investment across multiple properties and locations easily"
  },
  {
    icon: Zap,
    title: "Liquidity",
    description: "Trade your property tokens on our secondary market for quick and easy exits"
  },
  {
    icon: Lock,
    title: "Transparency & Security",
    description: "Blockchain technology ensures transparent and secure property management"
  }
]

export function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          Benefits
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-xl border-2 border-blue-600 hover:border-blue-400 transition-colors bg-gray-800"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

