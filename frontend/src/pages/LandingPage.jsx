import {Navbar} from '../components/Home/Navbar'
import { Hero } from '../components/Home/Hero'
import { Features } from '../components/Home/Features'
import { HowItWorks } from '../components/Home/HowItWorks'
import { Benefits } from '../components/Home/Benefits'
import { Footer } from '../components/Home/Footer'

const LandingPage = () => {
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
    


export default LandingPage