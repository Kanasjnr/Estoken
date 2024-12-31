import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin } from "react-feather";

export function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "/" }, 
    { icon: Twitter, href: "/" },
    { icon: Instagram, href: "/" },
    { icon: Linkedin, href: "/" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <a href="/" className="flex items-center">
              <img
                src="/Logo.png" 
                alt="Estoken Logo"
                className="h-10 w-auto" 
              />
            </a>
            <p className="text-gray-400 mt-4">
              Revolutionizing real estate investment through blockchain
              technology.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Properties", "How It Works", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">Email: estoken0@gmail.com</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
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
          <p>&copy; 2024 Estoken. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
