import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  handle: string;
  timestamp: string;
  isOwn: boolean;
}

const ChatBubble = ({ message, handle, timestamp, isOwn }: ChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col max-w-[80%] ${isOwn ? "ml-auto items-end" : "items-start"}`}
    >
      <span className="text-xs text-muted-foreground mb-1 px-1">
        {isOwn ? "You" : handle}
      </span>
      <div
        className={`px-4 py-3 rounded-2xl ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-secondary text-secondary-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      <span className="text-[10px] text-muted-foreground mt-1 px-1">
        {timestamp}
      </span>
    </motion.div>
  );
};

export default ChatBubble;
