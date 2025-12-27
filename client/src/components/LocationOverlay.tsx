import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";

interface LocationOverlayProps {
  isVisible: boolean;
}

const LocationOverlay = ({ isVisible }: LocationOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="w-full h-full rounded-full border-2 border-primary/20 border-t-primary" />
              </motion.div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              Finding Your Location
            </h2>
            <p className="text-muted-foreground text-sm max-w-[280px] mb-6">
              For the best experience, allow location access to discover nearby chat rooms
            </p>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Getting precise location...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationOverlay;
