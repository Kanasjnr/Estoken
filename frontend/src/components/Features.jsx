import { motion } from 'framer-motion'
import { Home, FileText, BarChart2, Shield, Users, Globe } from 'react-feather'

const features = [
  {
    icon: Home,
    title: "Property Tokenization",
    description: "Convert real estate into ERC-20 tokens for fractional ownership"
  },
  {
    icon: FileText,
    title: "Smart Contracts",
    description: "Secure and automated rental income distribution to token holders"
  },
  {
    icon: BarChart2,
    title: "Real-time Analytics",
    description: "Track property performance, rental yield, and token valuation"
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "KYC/AML processes ensure legal and secure investments"
  },
  {
    icon: Users,
    title: "Secondary Market",
    description: "Trade property tokens on our peer-to-peer marketplace"
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Invest in international properties from anywhere in the world"
  }
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-16"
        >
          Key Features
        </motion.h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-6 rounded-lg border border-blue-500 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

