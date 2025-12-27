import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { X, Users, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "@/components/ChatBubble";
import { io, Socket } from "socket.io-client";
import { toast } from "@/components/ui/use-toast";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const roomId = id || "";
  const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000";
  const handle = localStorage.getItem("chugli_handle") || "@You";
  const [memberCount, setMemberCount] = useState(1);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(apiBaseUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.emit("join_room", { roomId });

    socket.on("chat_history", (payload) => {
      if (!payload || payload.roomId !== roomId || !Array.isArray(payload.messages)) return;
      setMessages((prev) => {
        const merged = [...payload.messages, ...prev];
        const seen = new Set<string>();
        const next: any[] = [];
        for (const m of merged) {
          if (!m || !m.id) continue;
          if (seen.has(m.id)) continue;
          seen.add(m.id);
          next.push({ ...m, isOwn: m.handle === handle });
        }
        return next;
      });
    });

    socket.on("room_users", (payload) => {
      if (!payload || payload.roomId !== roomId) return;
      const count = Number(payload.count);
      if (Number.isFinite(count)) setMemberCount(count);
    });

    socket.on("receive_message", (msg) => {
      if (!msg || msg.roomId !== roomId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, isOwn: msg.handle === handle }];
      });
    });

    socket.on("room_deleted", (payload) => {
      if (!payload || payload.roomId !== roomId) return;
      toast({
        variant: "destructive",
        title: "Room deleted",
        description: "This room was deleted by the creator.",
      });
      navigate("/home");
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiBaseUrl, handle, roomId]);

  const handleSend = () => {
    if (message.trim()) {
      const outgoing = {
        roomId,
        message: message.trim(),
        handle,
      };

      socketRef.current?.emit("send_message", outgoing);
      setMessage("");
    }
  };

  const handleDeleteRoom = async () => {
    const token = localStorage.getItem("chugli_token");
    if (!token) {
      toast({
        variant: "destructive",
        title: "Not signed in",
        description: "Please sign in again.",
      });
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            variant: "destructive",
            title: "Cannot delete",
            description: "Only the room creator can delete this room.",
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Delete failed",
          description: data?.message || "Server error",
        });
        return;
      }

      toast({ title: "Room deleted" });
      navigate("/home");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach backend to delete room",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate pr-4">
              Room {roomId}
            </h1>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">{memberCount} members</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-live ml-1" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="destructive" size="sm" onClick={handleDeleteRoom}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => navigate("/home")}
              className="shrink-0"
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ChatBubble {...msg} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message Input - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 p-4 glass-effect border-t border-border/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full h-12 px-5 pr-12 rounded-full bg-secondary border-2 border-transparent focus:border-primary focus:outline-none text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>
          <Button
            variant="fab"
            size="icon"
            onClick={handleSend}
            disabled={!message.trim()}
            className="shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Chat;
