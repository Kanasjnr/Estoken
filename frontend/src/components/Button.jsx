export function Button({ children, variant = "primary", ...props }) {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]}`} 
      {...props}
    >
      {children}
    </button>
  )
}

