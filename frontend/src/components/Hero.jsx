import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const { scrollY } = useScroll();

  // Parallax effect for the hexagon
  const hexagonY = useTransform(scrollY, [0, 500], [0, 100]);

  // Handle mouse movement for floating effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = clientX - window.innerWidth / 2;
      const moveY = clientY - window.innerHeight / 2;
      const mouseXPercent = moveX / window.innerWidth;
      const mouseYPercent = moveY / window.innerHeight;

      setMousePosition({ x: mouseXPercent * 30, y: mouseYPercent * 30 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Particles initialization
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative h-screen flex items-center justify-center text-white overflow-hidden bg-[#020617]"
    >
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab",
              },
            },
            modes: {
              grab: {
                distance: 140,
                links: {
                  opacity: 0.5,
                },
              },
            },
          },
          particles: {
            color: {
              value: "#4F46E5",
            },
            links: {
              color: "#4F46E5",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10"></div>

      {/* Animated Hexagon */}
      <motion.div
        style={{ y: hexagonY }}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          rotateX: mousePosition.y * 0.1,
          rotateY: mousePosition.x * 0.1,
        }}
        transition={{ type: "spring", stiffness: 75, damping: 15 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <div className="relative">
          <svg className="w-64 h-64 md:w-96 md:h-96" viewBox="0 0 200 200">
            <motion.path
              d="M100,10 L190,50 L190,150 L100,190 L10,150 L10,50 Z"
              fill="none"
              stroke="rgba(79, 70, 229, 0.5)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          {/* Glow Effect */}
          <div className="absolute inset-0 blur-xl bg-indigo-500/30 animate-pulse"></div>
        </div>
      </motion.div>

      <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
        {/* Animated Text Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1 className="text-5xl md:text-7xl font-bold mb-6">
            {/* Split text animation */}
            {["Revolutionize", "Real", "Estate", "Investment"].map(
              (word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 + 0.5 }}
                  className="inline-block mr-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                >
                  {word}
                </motion.span>
              )
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-xl md:text-2xl mb-8 text-gray-300"
          >
            Fractional ownership made easy through blockchain tokenization
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {/* Animated Buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold 
                         hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 
                         shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_rgba(79,70,229,0.7)]"
            >
              Explore Properties
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg border border-indigo-500 text-white font-semibold 
                         hover:bg-indigo-500/10 transition-all duration-300"
            >
              Get Started{" "}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="w-6 h-6 text-white"
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
      </motion.div>
    </motion.section>
  );
}
