import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Linkedin } from 'react-feather'

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' }
  ]

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Estoken</h3>
            <p className="text-gray-400">Revolutionizing real estate investment through blockchain technology.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Properties', 'How It Works', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">123 Blockchain Street</p>
            <p className="text-gray-400">Crypto City, CC 12345</p>
            <p className="text-gray-400">contact@estoken.com</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2023 Estoken. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

