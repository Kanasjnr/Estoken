import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { Benefits } from './components/Benefits'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  )
}

