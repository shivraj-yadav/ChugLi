import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-xl" },
    md: { icon: 48, text: "text-2xl" },
    lg: { icon: 64, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 180 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="relative"
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          {/* Hourglass shape */}
          <path
            d="M16 8H48V16C48 24 40 32 32 32C40 32 48 40 48 48V56H16V48C16 40 24 32 32 32C24 32 16 24 16 16V8Z"
            fill="currentColor"
            opacity="0.2"
          />
          <path
            d="M16 8H48V16C48 24 40 32 32 32C40 32 48 40 48 48V56H16V48C16 40 24 32 32 32C24 32 16 24 16 16V8Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Top and bottom lines */}
          <line x1="12" y1="8" x2="52" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="56" x2="52" y2="56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* Sand particles */}
          <circle cx="32" cy="44" r="2" fill="currentColor" className="animate-pulse" />
          <circle cx="28" cy="48" r="1.5" fill="currentColor" opacity="0.7" />
          <circle cx="36" cy="48" r="1.5" fill="currentColor" opacity="0.7" />
        </svg>
      </motion.div>
      {showText && (
        <span className={`${text} font-bold tracking-tight text-foreground`}>
          ChugLi
        </span>
      )}
    </div>
  );
};

export default Logo;
