import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import RoomCard from "@/components/RoomCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateRoomModal from "@/components/CreateRoomModal";
import LocationOverlay from "@/components/LocationOverlay";
import { toast } from "@/components/ui/use-toast";
import { io, Socket } from "socket.io-client";

type ApiRoom = {
  _id: string;
  title: string;
  tags: string[];
  createdAt: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
};

type RoomCardVM = {
  id: string;
  title: string;
  distance: number;
  memberCount: number;
  expiresIn: number;
  tags: string[];
  isLive: boolean;
};

function haversineDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * R * Math.asin(Math.sqrt(h));
}

function minutesUntilExpiry(createdAt: string) {
  const createdMs = new Date(createdAt).getTime();
  const expiresMs = createdMs + 2 * 60 * 60 * 1000;
  const remainingMs = expiresMs - Date.now();
  return Math.max(0, Math.round(remainingMs / 60000));
}

const Home = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [rooms, setRooms] = useState<RoomCardVM[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const handleDeleteRoom = async (roomId: string) => {
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
        if (response.status === 401) {
          localStorage.removeItem("chugli_token");
          localStorage.removeItem("chugli_handle");
          navigate("/");
          return;
        }

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
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach backend to delete room",
      });
    }
  };

  useEffect(() => {
    const fetchNearbyRooms = async (lat: number, lng: number) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/rooms/nearby?lat=${lat}&lng=${lng}`);
        const data = (await response.json().catch(() => null)) as ApiRoom[] | null;

        if (!response.ok) {
          toast({
            variant: "destructive",
            title: "Could not load rooms",
            description: (data as any)?.message || "Server error",
          });
          return;
        }

        const mapped: RoomCardVM[] = (Array.isArray(data) ? data : []).map((r) => {
          const [roomLng, roomLat] = r.location.coordinates;
          const distKm = haversineDistanceKm(lat, lng, roomLat, roomLng);
          return {
            id: r._id,
            title: r.title,
            tags: r.tags || [],
            distance: Math.round(distKm * 10) / 10,
            memberCount: 1,
            expiresIn: minutesUntilExpiry(r.createdAt),
            isLive: true,
          };
        });

        setRooms(mapped);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Network error",
          description: "Could not reach backend for nearby rooms",
        });
      }
    };

    if (!navigator.geolocation) {
      setIsLoadingLocation(false);
      toast({
        variant: "destructive",
        title: "Location unavailable",
        description: "Your browser does not support geolocation.",
      });
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setCoords(next);
      setIsLoadingLocation(false);
      fetchNearbyRooms(next.lat, next.lng);
    };

    const onError = (error: GeolocationPositionError) => {
      setIsLoadingLocation(false);

      if (error.code === error.PERMISSION_DENIED) {
        toast({
          variant: "destructive",
          title: "Location permission denied",
          description: "Allow location access in your browser/Windows settings and try again.",
        });
        return;
      }

      if (error.code === error.TIMEOUT) {
        toast({
          variant: "destructive",
          title: "Location timeout",
          description:
            "Timed out while getting location. Retrying with relaxed accuracy...",
        });

        navigator.geolocation.getCurrentPosition(onSuccess, (err2) => {
          toast({
            variant: "destructive",
            title: "Location still not available",
            description: err2.message || "Please try again or check OS location settings.",
          });
        }, relaxedOptions);

        return;
      }

      toast({
        variant: "destructive",
        title: "Location unavailable",
        description: error.message || "Unable to get your location.",
      });
    };

    const relaxedOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, relaxedOptions);
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!coords) return;

    const socket = io(apiBaseUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("room_created", (room: any) => {
      try {
        if (!room || !room._id || !room.location || !Array.isArray(room.location.coordinates)) return;
        const [roomLng, roomLat] = room.location.coordinates;
        const distKm = haversineDistanceKm(coords.lat, coords.lng, roomLat, roomLng);
        if (distKm > 5) return;

        const vm: RoomCardVM = {
          id: String(room._id),
          title: String(room.title || ""),
          tags: Array.isArray(room.tags) ? room.tags : [],
          distance: Math.round(distKm * 10) / 10,
          memberCount: 1,
          expiresIn: minutesUntilExpiry(room.createdAt || new Date().toISOString()),
          isLive: true,
        };

        setRooms((prev) => {
          if (prev.some((r) => r.id === vm.id)) return prev;
          return [vm, ...prev];
        });
      } catch (err) {
        return;
      }
    });

    socket.on("room_deleted", (payload: any) => {
      if (!payload || !payload.roomId) return;
      const rid = String(payload.roomId);
      setRooms((prev) => prev.filter((r) => r.id !== rid));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [apiBaseUrl, coords]);

  const handleCreateRoom = (room: { title: string; tags: string[] }) => {
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

    if (!coords) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Please allow location access to create a room.",
      });
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/rooms/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: room.title,
            tags: room.tags,
            lat: coords.lat,
            lng: coords.lng,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("chugli_token");
            localStorage.removeItem("chugli_handle");
            navigate("/");
            return;
          }

          toast({
            variant: "destructive",
            title: "Room create failed",
            description: data?.message || "Server error",
          });
          return;
        }

        toast({ title: "Room created" });

        const nearbyResp = await fetch(
          `${apiBaseUrl}/api/rooms/nearby?lat=${coords.lat}&lng=${coords.lng}`
        );
        const nearbyData = (await nearbyResp.json().catch(() => null)) as ApiRoom[] | null;
        if (nearbyResp.ok && Array.isArray(nearbyData)) {
          const mapped: RoomCardVM[] = nearbyData.map((r) => {
            const [roomLng, roomLat] = r.location.coordinates;
            const distKm = haversineDistanceKm(coords.lat, coords.lng, roomLat, roomLng);
            return {
              id: r._id,
              title: r.title,
              tags: r.tags || [],
              distance: Math.round(distKm * 10) / 10,
              memberCount: 1,
              expiresIn: minutesUntilExpiry(r.createdAt),
              isLive: true,
            };
          });
          setRooms(mapped);
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Network error",
          description: "Could not reach backend to create room",
        });
      }
    })();
  };

  return (
    <>
      <LocationOverlay isVisible={isLoadingLocation} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <Logo size="sm" />
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </motion.header>

        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-5 py-3"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Discovering within 5km</span>
          </div>
        </motion.div>

        {/* Room List */}
        <div className="px-5 pb-24">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg font-bold text-foreground mb-4"
          >
            Active Rooms Nearby
          </motion.h2>

          <div className="space-y-4">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <RoomCard {...room} onDelete={handleDeleteRoom} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAB */}
        <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} />

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateRoom}
        />
      </div>
    </>
  );
};

export default Home;
