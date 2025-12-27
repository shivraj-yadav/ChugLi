import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        variant="fab"
        size="fab"
        onClick={onClick}
        className="shadow-elevated"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </motion.div>
  );
};

export default FloatingActionButton;
