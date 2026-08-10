"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
  useRoomContext,
  useParticipants,
  TrackToggle,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track, RoomEvent } from "livekit-client";
import LivePollCreator from "@/components/LivePollCreator";
import LiveChat from "@/components/LiveChat";
import { SessionLeaderboard, PollResultsOverlay } from "@/components/LiveLeaderboard";
import {
  Radio,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  Users,
  Clock,
  StopCircle,
  ImagePlus,
  Sparkles,
  Wifi,
  WifiOff,
  AlertTriangle,
  Hand,
  XCircle,
  BarChart2,
  X,
  ArrowLeft,
  Share2,
  Check,
  MessageSquare,
  Maximize,
  Minimize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  CalendarDays,
  Trash2,
  Film,
  MapPin,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { ReactionOverlay, ReactionPicker } from "@/components/LiveReactions";
import { useDuplicateTabGuard } from "@/hooks/useDuplicateTabGuard";

import { getApiBase } from "@/utils/api";
import { useTimetableStore } from "@/store/useTimetableStore";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL;
const API_BASE_URL = getApiBase();

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(h, 10));
  date.setMinutes(parseInt(m, 10));
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const playRaiseHandSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    const playNote = (freq, duration, startTime) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0.08, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Modern Digital Chime: Two ascending notes (D5 and A5) with exponential decay
    playNote(587.33, 0.12, now);
    playNote(880.00, 0.40, now + 0.10);
  } catch (e) {
    console.error("Failed to play hand raise notification sound:", e);
  }
};

// ─── Session Timer ───────────────────────────────────────────────────
function SessionTimer({ startTime }) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const hrs = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setElapsed(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-sm font-mono font-bold" style={{ color: "var(--text-secondary)" }}>
      <Clock size={14} />
      <span>{elapsed}</span>
    </div>
  );
}

// ─── Participant Counter ─────────────────────────────────────────────
function ViewerCount() {
  const participants = useParticipants();
  const viewerCount = Math.max(0, participants.length - 1); // Exclude the host

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: "var(--bg-badge)", color: "var(--text-accent)" }}
    >
      <Users size={14} />
      <span>{viewerCount} viewer{viewerCount !== 1 ? "s" : ""}</span>
    </div>
  );
}

function DraggableVideo({ track, name, isLocal = false, defaultPosition = { x: 20, y: 20 }, alignLeft = false }) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const boxRef = React.useRef(null);

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    handleStart(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      
      const parent = boxRef.current?.parentElement;
      let newX = clientX - dragStart.x;
      let newY = clientY - dragStart.y;

      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const boxRect = boxRef.current.getBoundingClientRect();
        const maxX = parentRect.width - boxRect.width;
        newX = Math.max(0, Math.min(newX, maxX));
        const maxY = parentRect.height - boxRect.height;
        newY = Math.max(0, Math.min(newY, maxY));
      }

      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragStart]);

  // Set default initial position on mount
  useEffect(() => {
    const parent = boxRef.current?.parentElement;
    if (parent && position.x === defaultPosition.x && position.y === defaultPosition.y) {
      const parentRect = parent.getBoundingClientRect();
      const x = alignLeft ? 16 : Math.max(16, parentRect.width - 208);
      const y = Math.max(16, parentRect.height - 156); // 144 (h-36) + 12
      setPosition({ x: Math.max(16, x), y: Math.max(16, y) });
    }
  }, [alignLeft, defaultPosition]);

  return (
    <div
      ref={boxRef}
      className="absolute z-50 w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/90 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none"
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <VideoTrack trackRef={track} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white pointer-events-none">
        {name} {isLocal && "(You)"}
      </div>
    </div>
  );
}

// ─── Live Broadcasting Panel ─────────────────────────────────────────
function BroadcastPanel({ session, onEndSession, authToken, shouldRecord }) {
  const { user, API_BASE } = useAuth();
  const room = useRoomContext();
  const [raisedHands, setRaisedHands] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  
  // Settings tab states
  const [disableChat, setDisableChat] = useState(false);
  const [privateChat, setPrivateChat] = useState(false);
  const [disableHandraise, setDisableHandraise] = useState(false);

  // Active Tab for sidebar
  const [activeTab, setActiveTab] = useState("chat");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activePoll, setActivePoll] = useState(null);         // poll currently running
  const [pollAnswers, setPollAnswers] = useState(new Map()); // Map<username, {chosenIdx, timeMs}>
  const [pollResultData, setPollResultData] = useState(null); // fetched after poll ends
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalPolls, setTotalPolls] = useState(0);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [showPollCreatorSignal, setShowPollCreatorSignal] = useState(false);

  const [connectionState, setConnectionState] = useState(room?.state || "disconnected");
  const [isBrowserOffline, setIsBrowserOffline] = useState(false);
  const [reactions, setReactions] = useState([]);

  // Recording State & Logics
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const startSessionRecording = async () => {
    if (!shouldRecord || isRecording || !session?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/livekit/session/${session.id}/record/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setIsRecording(true);
      } else {
        alert(data.message || "Failed to start recording.");
      }
    } catch (e) {
      console.error("Failed to start session recording:", e);
      alert("Network error. Could not reach server to start recording.");
    }
  };

  const stopSessionRecording = async () => {
    if (!isRecording || !session?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/livekit/session/${session.id}/record/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setIsRecording(false);
      }
    } catch (e) {
      console.error("Failed to stop session recording:", e);
    }
  };
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (connectionState === "connected") {
      startSessionRecording();
    } else if (connectionState === "disconnected" || connectionState === "reconnecting") {
      setIsRecording(false);
    }
  }, [connectionState, shouldRecord, session]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleReaction = useCallback((emoji) => {
    const reaction = {
      id: Date.now() + Math.random(),
      emoji,
      username: user?.username,
      xOffset: (Math.random() - 0.5) * 60,
    };
    setReactions((prev) => [...prev, reaction]);
    
    if (room && room.state === "connected" && room.localParticipant) {
      try {
        const payload = { action: "REACTION", reaction };
        const encoder = new TextEncoder();
        room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
          reliable: true,
          topic: "raise-hand-actions"
        });
      } catch (e) {
        console.error("Failed to publish REACTION:", e);
      }
    }
    
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
    }, 3000);
  }, [user, room]);

  useEffect(() => {
    if (!room) return;
    
    const handleStateChange = () => {
      setConnectionState(room.state);
    };

    room.on("connectionStateChanged", handleStateChange);
    
    // Listen for reconnection events specifically
    room.on("reconnecting", () => setConnectionState("reconnecting"));
    room.on("reconnected", () => setConnectionState("connected"));
    room.on("disconnected", () => setConnectionState("disconnected"));

    const handleOffline = () => setIsBrowserOffline(true);
    const handleOnline = () => setIsBrowserOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Initial check
    setIsBrowserOffline(!window.navigator.onLine);

    return () => {
      room.off("connectionStateChanged", handleStateChange);
      room.off("reconnecting", handleStateChange);
      room.off("reconnected", handleStateChange);
      room.off("disconnected", handleStateChange);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [room]);


  // Auto-dismiss the temporary raised hand notification after 4 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const localCameraTrack = tracks.find(
    (t) => t.source === Track.Source.Camera && t.participant?.isLocal
  );
  const localScreenTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.participant?.isLocal
  );
  const speakingStudentCameraTrack = tracks.find(
    (t) => t.source === Track.Source.Camera && t.participant?.identity === activeSpeaker
  );
  const speakingStudentScreenTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.participant?.identity === activeSpeaker
  );

  const isLocalCameraActive = !!localCameraTrack?.publication?.track && !localCameraTrack?.publication?.isMuted;
  const isStudentCameraActive = !!speakingStudentCameraTrack?.publication?.track && !speakingStudentCameraTrack?.publication?.isMuted;

  // Auto-stop admin screen share if student starts screen sharing
  useEffect(() => {
    if (speakingStudentScreenTrack?.publication?.track && localScreenTrack?.publication?.track) {
      room?.localParticipant?.setScreenShareEnabled(false);
    }
  }, [speakingStudentScreenTrack?.publication?.track, localScreenTrack?.publication?.track, room]);

  const sendStateSync = () => {
    if (!room || room.state !== "connected" || !room.localParticipant) return;
    try {
      const payload = {
        action: "SYNC_STATE",
        activeSpeaker,
        raisedHands,
        blockedUsers,
        disableChat,
        privateChat,
        disableHandraise,
      };
      const encoder = new TextEncoder();
      const encodedPayload = encoder.encode(JSON.stringify(payload));
      room.localParticipant.publishData(encodedPayload, {
        reliable: true,
        topic: "raise-hand-actions",
      });
    } catch (e) {
      console.warn("Failed to publish SYNC_STATE:", e);
    }
  };

  const acceptSpeaker = (studentUsername) => {
    // Revoke previous speaker
    if (activeSpeaker) {
      revokeSpeaker();
    }
    setActiveSpeaker(studentUsername);
    setRaisedHands((prev) => prev.filter((u) => u !== studentUsername));

    if (room && room.state === "connected" && room.localParticipant) {
      try {
        const payload = { action: "ACCEPT_SPEAKER", username: studentUsername };
        const encoder = new TextEncoder();
        room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
          reliable: true,
          topic: "raise-hand-actions",
        });
      } catch (e) {
        console.error("Failed to publish ACCEPT_SPEAKER:", e);
      }
    }
  };

  const rejectHand = (studentUsername) => {
    setRaisedHands((prev) => prev.filter((u) => u !== studentUsername));
    if (room && room.state === "connected" && room.localParticipant) {
      try {
        const payload = { action: "DISMISS_HAND", username: studentUsername };
        const encoder = new TextEncoder();
        room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
          reliable: true,
          topic: "raise-hand-actions",
        });
      } catch (e) {
        console.error("Failed to publish DISMISS_HAND:", e);
      }
    }
  };

  const revokeSpeaker = () => {
    if (!activeSpeaker) return;
    const oldSpeaker = activeSpeaker;
    setActiveSpeaker(null);
    setRaisedHands((prev) => prev.filter((u) => u !== oldSpeaker));

    if (room && room.state === "connected" && room.localParticipant) {
      try {
        const payload = { action: "REMOVE_SPEAKER", username: oldSpeaker };
        const encoder = new TextEncoder();
        room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
          reliable: true,
          topic: "raise-hand-actions",
        });
      } catch (e) {
        console.error("Failed to publish REMOVE_SPEAKER:", e);
      }
    }
  };

  const clearAllHands = () => {
    setRaisedHands([]);
  };

  // Lower hand and end stage speak if a student gets blocked
  useEffect(() => {
    let changed = false;
    let newHands = [...raisedHands];
    let newSpeaker = activeSpeaker;

    blockedUsers.forEach((blockedUsername) => {
      if (newHands.includes(blockedUsername)) {
        newHands = newHands.filter((u) => u !== blockedUsername);
        changed = true;
      }
      if (newSpeaker === blockedUsername) {
        newSpeaker = null;
        changed = true;
        // Notify the room to remove this speaker
        if (room && room.state === "connected" && room.localParticipant) {
          try {
            const payload = { action: "REMOVE_SPEAKER", username: blockedUsername };
            const encoder = new TextEncoder();
            room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
              reliable: true,
              topic: "raise-hand-actions",
            });
          } catch (e) {
            console.error("Failed to publish REMOVE_SPEAKER on block:", e);
          }
        }
      }
    });

    if (changed) {
      setRaisedHands(newHands);
      setActiveSpeaker(newSpeaker);
    }
  }, [blockedUsers, activeSpeaker, raisedHands, room]);

  // Sync state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      sendStateSync();
    }, 3000);
    return () => clearInterval(interval);
  }, [room, activeSpeaker, raisedHands, blockedUsers, disableChat, privateChat, disableHandraise]);

  // Sync settings immediately on change
  useEffect(() => {
    sendStateSync();
  }, [disableChat, privateChat, disableHandraise]);

  // Handle incoming data (raise-hand-actions topic)
  useEffect(() => {
    if (!room) return;

    const handleData = (payload, participant, block, topic) => {
      const decoder = new TextDecoder();
      try {
        const data = JSON.parse(decoder.decode(payload));

        // ── Poll events ───────────────────────────────────────────
        if (data.action === "POLL_ANSWER") {
          setPollAnswers(prev => {
            const next = new Map(prev);
            next.set(data.username, { chosenIdx: data.chosenIdx, timeMs: data.timeMs });
            return next;
          });
          return;
        }

        // ── Hand raise / speaker events ───────────────────────────
        if (data.action === "RAISE_HAND") {
          if (blockedUsers.includes(data.username)) return;
          playRaiseHandSound();
          setRaisedHands((prev) => {
            if (prev.includes(data.username)) return prev;
            return [...prev, data.username];
          });
        } else if (data.action === "LOWER_HAND") {
          setRaisedHands((prev) => prev.filter((u) => u !== data.username));
        } else if (data.action === "REMOVE_SPEAKER") {
          setActiveSpeaker((curr) => curr === data.username ? null : curr);
          setRaisedHands((prev) => prev.filter((u) => u !== data.username));
        } else if (data.action === "REQUEST_SYNC") {
          sendStateSync();
        } else if (data.action === "REACTION") {
          setReactions((prev) => [...prev, data.reaction]);
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== data.reaction.id));
          }, 3000);
        }
      } catch (e) {
        console.error("Error parsing room data:", e);
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, activeSpeaker, raisedHands, blockedUsers]);


  const fetchLeaderboard = async () => {
    if (!session?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/livekit/session/${session.id}/leaderboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setTotalPolls(data.totalPolls);
        if (data.lastPollId) {
          fetchPollResults(data.lastPollId, false);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch leaderboard:", e);
    }
  };

  useEffect(() => {
    if (session?.id && authToken) {
      fetchLeaderboard();
    }
  }, [session?.id, authToken]);

  // Fetch per-question results overlay
  const fetchPollResults = async (pollId, showOverlay = true) => {
    if (!session?.id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/livekit/poll/${pollId}/results`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setPollResultData(data);
        if (showOverlay) {
          setShowResultOverlay(true);
          // Auto-dismiss after 12s
          setTimeout(() => setShowResultOverlay(false), 12000);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch poll results:", e);
    }
  };

  const handlePollLaunched = (poll) => {
    setActivePoll(poll);
    setPollAnswers(new Map());
  };

  const handlePollEnded = async () => {
    if (!activePoll) return;
    const endedPollId = activePoll.id;
    setActivePoll(null);
    setPollAnswers(new Map());
    // Fetch results and leaderboard from DB (source of truth)
    await fetchPollResults(endedPollId);
    await fetchLeaderboard();
  };


  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = useCallback(() => {
    if (!session?.id) return;
    const shareUrl = `${window.location.origin}/live?sessionId=${session.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }, [session?.id]);

  // Handle participant connections
  useEffect(() => {
    if (!room) return;

    const handleParticipantDisconnected = (participant) => {
      const username = participant.identity;
      setRaisedHands((prev) => prev.filter((u) => u !== username));
      if (activeSpeaker === username) {
        setActiveSpeaker(null);
      }
    };

    room.on("participantDisconnected", handleParticipantDisconnected);
    return () => {
      room.off("participantDisconnected", handleParticipantDisconnected);
    };
  }, [room, activeSpeaker]);

  return (
    <div className="space-y-3 animate-fade-in h-full flex flex-col min-h-0 overflow-hidden">
      {/* Live indicator header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </div>
          <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            {session.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <SessionTimer startTime={session.startedAt} />
          <ViewerCount />
        </div>
      </div>

      {/* Network Error Notification Banner */}
      {(isBrowserOffline || connectionState === "reconnecting" || connectionState === "disconnected") && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-500/10 border border-[var(--border-primary)] border-red-500/20 text-red-500 text-xs font-bold animate-pulse shrink-0">
          <AlertTriangle size={16} className="shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-xs">
              {isBrowserOffline ? "Offline Mode: Internet Disconnected" : connectionState === "reconnecting" ? "Network Connection Dropped" : "Stream Disconnected"}
            </p>
            <p className="text-[10px] opacity-80 mt-0.5">
              {isBrowserOffline 
                ? "Your internet connection is offline. Please check your network cables or Wi-Fi." 
                : connectionState === "reconnecting"
                ? "We lost connection to the server. Attempting to reconnect automatically, please wait..."
                : "You have been disconnected from the session. Please check your connection and reload the page."}
            </p>
          </div>
          {connectionState === "disconnected" && (
            <button 
              onClick={() => window.location.reload()}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase transition-all shadow-md shrink-0 cursor-pointer"
            >
              Reload Page
            </button>
          )}
        </div>
      )}

      {/* Center board | Right chat flex wrapper */}
      <div className="flex gap-4 flex-col xl:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Center — Live Classroom Board */}
        <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden order-1">
          {/* Video Preview Area */}
          <div className="relative rounded-[1.35rem] overflow-hidden border border-[var(--border-primary)] flex-1 min-h-0 bg-black shadow-[0_18px_55px_rgba(15,23,42,0.18)]"
            style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
          >
            {speakingStudentScreenTrack?.publication?.track ? (
              <VideoTrack
                trackRef={speakingStudentScreenTrack}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : localScreenTrack?.publication?.track ? (
              <VideoTrack
                trackRef={localScreenTrack}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-500/10 border border-[var(--border-primary)] border-zinc-500/20 flex items-center justify-center mx-auto shadow-inner">
                    <Radio size={40} className="text-zinc-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                      Broadcasting Studio
                    </h3>
                    <p className="text-[11px] text-slate-500 max-w-[280px] leading-relaxed">
                      Use the controls below to stream video, audio, or present your screen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Draggable Local Camera Preview */}
            {isLocalCameraActive && (
              <DraggableVideo
                track={localCameraTrack}
                name="You (Mentor)"
                isLocal={true}
                defaultPosition={{ x: 20, y: 20 }}
              />
            )}

            {/* Draggable Speaking Student Preview */}
            {isStudentCameraActive && (
              <DraggableVideo
                track={speakingStudentCameraTrack}
                name={activeSpeaker}
                isLocal={false}
                alignLeft={true}
              />
            )}

            {/* Connection status indicator */}
            <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold ${
                isBrowserOffline || connectionState === "reconnecting"
                  ? "text-amber-400 animate-pulse"
                  : connectionState === "disconnected"
                  ? "text-red-400 animate-pulse"
                  : "text-emerald-400"
              }`}>
                {isBrowserOffline || connectionState === "reconnecting" ? (
                  <>
                    <WifiOff size={10} />
                    Reconnecting...
                  </>
                ) : connectionState === "disconnected" ? (
                  <>
                    <WifiOff size={10} />
                    Disconnected
                  </>
                ) : (
                  <>
                    <Wifi size={10} />
                    Connected
                  </>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shrink-0" />
                  <span>REC {formatTime(recordingDuration)}</span>
                </div>
              )}
            </div>

            {/* Per-question results overlay after POLL_END */}
            {showResultOverlay && pollResultData && (
              <PollResultsOverlay
                pollData={pollResultData}
                currentUsername={user?.username}
                onClose={() => setShowResultOverlay(false)}
              />
            )}

            <ReactionOverlay reactions={reactions} />
          </div>

          {/* Broadcast Control Bar */}
          <div className="flex items-center justify-center p-3.5 rounded-[1.35rem] border border-[var(--border-primary)] bg-[var(--bg-card)]/40 backdrop-blur-md shrink-0 shadow-lg"
            style={{ borderColor: "rgba(148, 163, 184, 0.16)" }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <TrackToggle
                source={Track.Source.Microphone}
                showIcon={true}
                className="px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-sm text-slate-200 hover:text-white bg-[var(--bg-hover)] border-[var(--border-primary)]/50 hover:bg-slate-750"
              >
                Mic
              </TrackToggle>
              <TrackToggle
                source={Track.Source.Camera}
                showIcon={true}
                className="px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-sm text-slate-200 hover:text-white bg-[var(--bg-hover)] border-[var(--border-primary)]/50 hover:bg-slate-750"
              >
                Camera
              </TrackToggle>
              {speakingStudentScreenTrack?.publication?.track ? (
                <button
                  disabled
                  className="px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-extrabold uppercase tracking-wider transition-all opacity-40 cursor-not-allowed text-slate-200 bg-[var(--bg-hover)] border-[var(--border-primary)]/50"
                  title="A student is currently sharing their screen"
                >
                  Share Screen
                </button>
              ) : (
                <TrackToggle
                  source={Track.Source.ScreenShare}
                  showIcon={true}
                  className="px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-sm text-slate-200 hover:text-white bg-[var(--bg-hover)] border-[var(--border-primary)]/50 hover:bg-slate-750"
                >
                  Share Screen
                </TrackToggle>
              )}

              <div className="w-px h-8 bg-slate-500/20 mx-2" />

              {/* Poll Tab Toggle Button */}
              <button
                onClick={() => {
                  setActiveTab("polls");
                  setShowPollCreatorSignal((v) => !v);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 cursor-pointer shadow-sm ${
                  activeTab === "polls" || activePoll
                    ? "bg-[var(--accent-primary)] border-transparent text-white animate-pulse"
                    : "bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-primary)]"
                }`}
                id="poll-tab-btn"
              >
                <BarChart2 size={14} />
                {activePoll ? "Active Poll" : "Create Poll"}
              </button>

              <div className="w-px h-8 bg-slate-500/20 mx-2" />

              {/* Chat Toggle Button */}
              <button
                onClick={() => setIsChatOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 cursor-pointer shadow-sm ${
                  isChatOpen
                    ? "bg-[var(--accent-primary)] border-transparent text-white"
                    : "bg-[var(--bg-primary)] border-[var(--border-primary)] text-[var(--text-primary)]"
                }`}
                title={isChatOpen ? "Hide Live Chat" : "Show Live Chat"}
                id="admin-chat-toggle-btn"
              >
                <MessageSquare size={14} />
                Live Chat
              </button>

              <ReactionPicker onReact={handleReaction} />



              <button
                onClick={handleShareLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-primary)] text-[10px] font-bold uppercase tracking-wide transition-all hover:scale-105 cursor-pointer shadow-sm text-[var(--text-primary)] bg-[var(--bg-primary)] border-[var(--border-primary)]"
                title="Copy share link for students"
              >
                {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                {copiedLink ? "Copied" : "Share"}
              </button>

              <button
                onClick={onEndSession}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-red-500/20 cursor-pointer"
              >
                <StopCircle size={14} />
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Right — Live Chat */}
        <div className={`w-full lg:w-[320px] lg:min-w-[300px] lg:max-w-[360px] flex flex-col min-h-0 overflow-hidden shrink-0 order-2 ${!isChatOpen ? "hidden" : ""}`}>
          <LiveChat
            persistent
            sessionId={session?.id}
            hostUsername={session?.host?.username || ""}
            isHost={true}
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
            className="flex-1 min-h-0"
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            raisedHands={raisedHands}
            activeSpeaker={activeSpeaker}
            acceptSpeaker={acceptSpeaker}
            rejectHand={rejectHand}
            revokeSpeaker={revokeSpeaker}
            activePoll={activePoll}
            pollAnswers={pollAnswers}
            pollResultData={pollResultData}
            leaderboard={leaderboard}
            totalPolls={totalPolls}
            onPollLaunched={(poll) => {
              setActivePoll(poll);
              setPollAnswers(new Map());
            }}
            onPollEnded={handlePollEnded}
            authToken={authToken}
            controlledActiveTab={activeTab}
            onTabChange={setActiveTab}
            showPollCreatorExternal={showPollCreatorSignal}
            disableChat={disableChat}
            setDisableChat={setDisableChat}
            privateChat={privateChat}
            setPrivateChat={setPrivateChat}
            disableHandraise={disableHandraise}
            setDisableHandraise={setDisableHandraise}
          />
        </div>
      </div>

      {/* Play remote speaking student audio streams */}
      <RoomAudioRenderer />

      {/* Toast Notification for Hand Raises - Disabled to prevent annoying popups */}
    </div>
  );
}

// ─── Main Admin Live Page ────────────────────────────────────────────
export default function AdminLivePage() {
  const router = useRouter();
  const { user, token: authToken, API_BASE, activeSession, setActiveSession } = useAuth();
  const [livekitToken, setLivekitToken] = useState(null);
  const [session, setSession] = useState(null);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    thumbnailPreview: null,
    thumbnailUrl: "",
  });
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkOpts, setWatermarkOpts] = useState({
    inst: true,
    username: true,
    email: true,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [pendingEndAction, setPendingEndAction] = useState(null);

  // Batches targeting state
  const [batches, setBatches] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [showRecordPrompt, setShowRecordPrompt] = useState(false);
  const [shouldRecord, setShouldRecord] = useState(false);

  // Today's assigned classes (from timetable)
  const { todayClasses, isLoading: isTimetableLoading, fetchTodayClasses, cancelSession } = useTimetableStore();
  useEffect(() => {
    if (authToken && (user?.role === "MENTOR" || user?.role === "BATCH_MANAGER")) {
      fetchTodayClasses("FACULTY", authToken, API_BASE || API_BASE_URL);
    }
  }, [authToken, user?.role]);

  // Mentor unified view state
  const [selectedClassId, setSelectedClassId] = useState(null); // which class card has Go Live form open
  const [showUnplannedForm, setShowUnplannedForm] = useState(false);

  const handleClassGoLive = (entry) => {
    if (selectedClassId === entry.id) {
      // toggle off
      setSelectedClassId(null);
      return;
    }
    setSelectedClassId(entry.id);
    setShowUnplannedForm(false);
    // Pre-fill the form with class details
    const batchId = entry.timetable?.batch?.id;
    setFormState({
      title: `${entry.subject?.name || "Class"} — ${entry.timetable?.batch?.name || ""}`,
      description: "",
      thumbnailPreview: null,
      thumbnailUrl: "",
    });
    setScheduledAtDate("");
    setSelectedBatchIds(batchId ? [batchId] : []);
    setError(null);
  };

  const handleUnplannedToggle = () => {
    setShowUnplannedForm(v => !v);
    setSelectedClassId(null);
    setFormState({ title: "", description: "", thumbnailPreview: null, thumbnailUrl: "" });
    setScheduledAtDate("");
    setSelectedBatchIds([]);
    setError(null);
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        if (!authToken) return;
        const url = user?.role === "BATCH_MANAGER" 
          ? `${API_BASE}/api/batches/batch-manager/batches`
          : `${API_BASE}/api/batches`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.batches)) {
          setBatches(data.batches);
        }
      } catch (err) {
        console.error("Failed to load batches in live view:", err);
      }
    };
    fetchBatches();
  }, [authToken, user, API_BASE]);

  const [pastSessions, setPastSessions] = useState([]);
  const [loadingPast, setLoadingPast] = useState(false);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [scheduledAtDate, setScheduledAtDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [startConfirmSession, setStartConfirmSession] = useState(null);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState(null);
  const [deletePastConfirmSession, setDeletePastConfirmSession] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPastModal, setShowPastModal] = useState(false);
  const [rightColumnTab, setRightColumnTab] = useState("upcoming"); // "upcoming" | "past"
  const [checkingSession, setCheckingSession] = useState(true); // true until we've checked for active session
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedVideoSession, setSelectedVideoSession] = useState(null);
  const [watermarkPos, setWatermarkPos] = useState({ top: "15%", left: "15%" });

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Duplicate Tab Detection & Guard
  const { isDuplicateTab, claimActiveTab } = useDuplicateTabGuard(session?.id);

  useEffect(() => {
    if (!selectedVideoUrl) return;

    const handleFullscreenChange = () => {
      const currentFullscreenEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      const isCurrentlyFullscreen = !!currentFullscreenEl;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [selectedVideoUrl]);

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      const requestFullscreen =
        container.requestFullscreen ||
        container.webkitRequestFullscreen ||
        container.mozRequestFullScreen ||
        container.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(container).catch((err) => {
          console.error("Error entering container fullscreen:", err);
        });
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(document).catch(console.error);
      }
    }
  };

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!selectedVideoUrl) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    } else {
      setIsPlaying(true);
    }
  }, [selectedVideoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(console.error);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!selectedVideoUrl) return;
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 65) + 15;
      const left = Math.floor(Math.random() * 65) + 15;
      setWatermarkPos({ top: `${top}%`, left: `${left}%` });
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedVideoUrl]);

  const fetchPastSessions = async () => {
    try {
      setLoadingPast(true);
      const res = await fetch(`${API_BASE}/api/livekit/sessions`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();
      if (data.success && data.sessions) {
        // Filter only ended/past sessions
        const ended = data.sessions.filter((s) => !s.isLive && s.endedAt);
        setPastSessions(ended);
      }
    } catch (err) {
      console.error("Failed to fetch past sessions:", err);
    } finally {
      setLoadingPast(false);
    }
  };

  const handleDeleteSession = (past) => {
    setDeletePastConfirmSession(past);
  };

  const executeDeleteSession = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/livekit/session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setPastSessions((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(data.message || "Failed to delete past broadcast.");
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError("Error connecting to server to delete session.");
    }
  };

  const fetchScheduledSessions = async () => {
    try {
      setLoadingScheduled(true);
      const res = await fetch(`${API_BASE}/api/livekit/sessions/scheduled`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();
      if (data.success && data.sessions) {
        setScheduledSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to fetch scheduled sessions:", err);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!formState.title.trim()) {
      setError("Session title is required.");
      return;
    }
    if (!scheduledAtDate) {
      setError("Please select a date and time to schedule the class.");
      return;
    }

    setIsScheduling(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/livekit/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          thumbnailUrl: formState.thumbnailUrl,
          scheduledAt: scheduledAtDate,
          isScheduled: true,
          batchIds: selectedBatchIds,
          showWatermark,
          watermarkOptions: Object.keys(watermarkOpts).filter(k => watermarkOpts[k]).join(','),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to schedule session.");
        return;
      }

      setFormState({ title: "", description: "", thumbnailPreview: null, thumbnailUrl: "" });
      setScheduledAtDate("");
      fetchScheduledSessions();
      setSuccessMsg("Live class scheduled successfully!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e) {
      console.error("[LIVE] handleScheduleSession error:", e);
      setError("Failed to schedule session.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartScheduledSession = (schedSession) => {
    setStartConfirmSession(schedSession);
  };

  const executeStartScheduledSession = async (schedSession) => {
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/livekit/session/${schedSession.id}/start`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to start live session.");
        setIsStarting(false);
        return;
      }

      setSession(data.session);
      setActiveSession(data.session);
      await fetchToken(data.session.roomName);
      setScheduledSessions(prev => prev.filter(s => s.id !== schedSession.id));
    } catch (e) {
      console.error("Failed to start scheduled session:", e);
      setError("Error starting live session.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleDeleteScheduledSession = (schedSession) => {
    setDeleteConfirmSession(schedSession);
  };

  const executeDeleteScheduledSession = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/livekit/session/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setScheduledSessions((prev) => prev.filter((s) => s.id !== id));
      } else {
        setError(data.message || "Failed to cancel scheduled session.");
      }
    } catch (err) {
      console.error("Failed to cancel scheduled session:", err);
      setError("Error connecting to server to cancel session.");
    }
  };

  useEffect(() => {
    if (!session && authToken) {
      fetchPastSessions();
      fetchScheduledSessions();
    }
  }, [session, authToken]);

  // Auto-poll recently ended sessions to fetch compilation status in real-time
  useEffect(() => {
    const hasProcessing = pastSessions.some(
      (s) => s.isRecording && !s.recordingUrl && (s.egressSegments || (s.endedAt && (new Date() - new Date(s.endedAt)) < 180000))
    );

    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchPastSessions();
    }, 6000); // Check every 6 seconds

    return () => clearInterval(interval);
  }, [pastSessions]);

  // Check for existing live session on mount — works for any admin/mentor (no hostId restriction)
  useEffect(() => {
    if (!authToken) return;
    async function checkActive() {
      setCheckingSession(true);
      try {
        const res = await fetch(`${API_BASE}/api/livekit/session/active`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (data.success && data.session) {
          // Any active session — reconnect regardless of who started it
          setSession(data.session);
          setActiveSession(data.session);
          // fetchToken needs authToken — will be called once token is ready
          fetchToken(data.session.roomName);
        }
      } catch (e) {
        console.error("Failed to check active session:", e);
      } finally {
        setCheckingSession(false);
      }
    }
    checkActive();
  }, [authToken]);

  // If authToken becomes available after session was already found, fetch the token
  useEffect(() => {
    if (authToken && session && !livekitToken) {
      fetchToken(session.roomName);
    }
  }, [authToken, session]);

  const fetchToken = async (roomName) => {
    try {
      const res = await fetch(`${API_BASE}/api/livekit/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ roomName }),
      });
      const data = await res.json();
      if (data.success) {
        setLivekitToken(data.token);
      }
    } catch (e) {
      console.error("Failed to fetch LiveKit token:", e);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB (10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Thumbnail image exceeds the 10MB size limit. Please choose a smaller file.");
      e.target.value = ""; // Clear file input selection
      setFormState((prev) => ({
        ...prev,
        thumbnailPreview: null,
        thumbnailUrl: "",
      }));
      return;
    }

    setError(null);

    // Convert to base64 for storage (simple approach)
    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        thumbnailPreview: reader.result,
        thumbnailUrl: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const startActualSession = async () => {
    console.log("[LIVE] startActualSession triggered");
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/livekit/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          thumbnailUrl: formState.thumbnailUrl,
          batchIds: selectedBatchIds,
          showWatermark,
          watermarkOptions: Object.keys(watermarkOpts).filter(k => watermarkOpts[k]).join(','),
        }),
      });

      const data = await res.json();
      console.log("[LIVE] startActualSession response data:", data);

      if (!data.success) {
        setError(data.message || "Failed to start session.");
        setIsStarting(false);
        return;
      }

      setSession(data.session);
      setActiveSession(data.session);
      await fetchToken(data.session.roomName);
    } catch (e) {
      console.error("[LIVE] startActualSession error:", e);
      setError("Network error. Is the backend running?");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartSession = async () => {
    console.log("[LIVE] handleStartSession clicked. title:", formState.title);
    if (!formState.title.trim()) {
      setError("Session title is required.");
      return;
    }
    setError(null);
    startActualSession();
  };

  const endActiveSession = async () => {
    if (!session) return false;

    try {
      const res = await fetch(`${API_BASE}/api/livekit/session/${session.id}/end`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSession(null);
        setActiveSession(null);
        setLivekitToken(null);
        setFormState({ title: "", description: "", thumbnailPreview: null, thumbnailUrl: "" });
        return true;
      }
    } catch (e) {
      console.error("Failed to end session:", e);
    }
    return false;
  };

  const handleEndSession = async () => {
    if (!session) return;
    setPendingEndAction("end");
    setShowEndConfirm(true);
  };

  const handleBackToPortal = async () => {
    setPendingEndAction("portal");
    setShowEndConfirm(true);
  };

  // ─── Checking for active session (loading state) ─────────────────────
  if (checkingSession) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-accent)", borderTopColor: "transparent" }} />
          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Checking for active session...</p>
        </div>
      </div>
    );
  }

  // ─── MENTOR ─ Unified Class-Centric Live Sessions View ────────────
  if (!session && !livekitToken && (user?.role === "MENTOR" || user?.role === "BATCH_MANAGER")) {

    const InlineSessionForm = ({ classEntry = null }) => (
      <div className="rounded-2xl border p-5 space-y-4 mt-3 shadow-sm"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--accent-primary)" }}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Session Title *</label>
          <input type="text" value={formState.title}
            onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. DSA Masterclass — Trees & Graphs"
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors focus:border-[var(--accent-primary)]"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Description</label>
          <textarea value={formState.description}
            onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of what you'll cover..." rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors resize-none focus:border-[var(--accent-primary)]"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Thumbnail (Optional)</label>
            <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">16:9 · Max 10MB</span>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor={`thumb-${classEntry?.id || "free"}`}
              className="flex flex-col items-center justify-center w-28 h-16 rounded-xl border-2 border-dashed cursor-pointer hover:border-zinc-400/60 transition-all"
              style={{ borderColor: "var(--border-primary)" }}>
              {formState.thumbnailPreview
                ? <img src={formState.thumbnailPreview} alt="Thumb" className="w-full h-full object-cover rounded-xl" />
                : <div className="text-center"><ImagePlus size={16} className="mx-auto" style={{ color: "var(--text-muted)" }} /><span className="text-[9px] font-bold block" style={{ color: "var(--text-muted)" }}>Upload</span></div>}
              <input type="file" id={`thumb-${classEntry?.id || "free"}`} accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
            </label>
            <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>Cover image shown to students before joining.</p>
          </div>
        </div>
        {!classEntry && batches.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>Target Cohorts</label>
            <div className="rounded-xl p-3 border grid grid-cols-2 gap-1.5" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
              {batches.map(b => (
                <label key={b.id} className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-0.5 hover:text-[var(--accent-primary)] transition-colors" style={{ color: "var(--text-primary)" }}>
                  <input type="checkbox" checked={selectedBatchIds.includes(b.id)}
                    onChange={() => setSelectedBatchIds(prev => prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id])}
                    className="rounded cursor-pointer" />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
          <div><p className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>Record Session</p><p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Auto-record for playback later</p></div>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input type="checkbox" checked={shouldRecord} onChange={(e) => setShouldRecord(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-700/60 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Schedule for Later (Optional)</label>
          <input type="datetime-local" value={scheduledAtDate} onChange={(e) => setScheduledAtDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)", color: "var(--text-primary)" }} />
        </div>
        {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold"><AlertTriangle size={13} />{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleStartSession} disabled={isStarting || isScheduling || !formState.title.trim()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-extrabold uppercase tracking-wide shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ background: "var(--accent-primary)" }}>
            {isStarting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting...</> : <><Radio size={14} />Go Live Now</>}
          </button>
          <button onClick={handleScheduleSession} disabled={isStarting || isScheduling || !formState.title.trim() || !scheduledAtDate}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:bg-[var(--bg-hover)]"
            style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
            {isScheduling ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-amber-500" />Scheduling...</> : <><CalendarDays size={14} className="text-amber-500" />Schedule</>}
          </button>
        </div>
      </div>
    );

    const now = new Date();
    const todayDateStr = now.toISOString().split("T")[0];
    const sortedClasses = [...todayClasses].map(c => ({
      ...c,
      isCanceled: c.canceledDates && c.canceledDates.includes(todayDateStr)
    })).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    const nowPlus5 = new Date(now.getTime() + 5 * 60000);
    const nowStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const nowPlus5Str = nowPlus5.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const nowMinus20 = new Date(now.getTime() - 20 * 60000);
    const nowMinus20Str = nowMinus20.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    let currentClassIndex = -1;
    currentClassIndex = sortedClasses.findIndex(c => nowPlus5Str >= c.startTime && nowStr <= c.endTime);
    if (currentClassIndex === -1) {
      currentClassIndex = sortedClasses.findIndex(c => nowStr < c.startTime);
    }
    if (currentClassIndex === -1 && sortedClasses.length > 0) {
      const lastClass = sortedClasses[sortedClasses.length - 1];
      if (nowMinus20Str <= lastClass.endTime) {
        currentClassIndex = sortedClasses.length - 1;
      }
    }

    const currentClass = sortedClasses[currentClassIndex] || null;
    const otherClasses = sortedClasses.filter((_, idx) => idx !== currentClassIndex);
    const upcomingClasses = otherClasses.filter(c => nowMinus20Str <= c.endTime);
    const missedClasses = otherClasses.filter(c => nowMinus20Str > c.endTime);
    
    const missedAsPast = missedClasses.map(entry => {
      const todayDateStr = now.toISOString().split("T")[0];
      return {
        id: "missed_" + entry.id,
        title: entry.subject?.name + " (Missed)",
        host: entry.faculty,
        startedAt: new Date(`${todayDateStr}T${entry.startTime}:00`).toISOString(),
        endedAt: null,
        recordingUrl: null,
        isRecording: false,
        isMissed: true
      };
    });
    const allPast = [...pastSessions, ...missedAsPast].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    const isActiveClass = currentClass && !currentClass.isCanceled && (nowPlus5Str >= currentClass.startTime && nowMinus20Str <= currentClass.endTime);

    return (
        <div className="space-y-6 min-h-0 flex flex-col flex-1 animate-in fade-in duration-500" style={{ color: "var(--text-primary)" }}>            {/* Header section */}
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
              <div className="space-y-2">

                <h1 className="text-4xl font-serif tracking-tight">
                  Today&apos;s Classes
                </h1>
                <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
                  {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              {successMsg && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20 shrink-0">
                  <Check size={14} />{successMsg}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
              <div className="space-y-8">

            {/* Assigned Class Cards */}
            {isTimetableLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid var(--accent-primary)", borderTopColor: "transparent" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Loading your classes...</p>
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-[var(--border-primary)] text-center space-y-3 bg-[var(--bg-card)]">
                <CalendarDays size={36} style={{ color: "var(--accent-primary)", opacity: 0.5 }} />
                <div>
                  <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>No classes today</h3>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Start an unplanned session below.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(currentClass ? [currentClass] : []).map((entry) => {
                  const isOpen = selectedClassId === entry.id;
                  const palettes = [
                    { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.3)", text: "#8b5cf6" },
                    { bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.3)", text: "#0ea5e9" },
                    { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)", text: "#10b981" },
                    { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
                    { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" },
                  ];
                  const p = palettes[(entry.subject?.name?.charCodeAt(0) || 0) % palettes.length];
                  return (
                    <div key={entry.id} className="rounded-2xl border overflow-hidden shadow-sm transition-all duration-200"
                      style={{ backgroundColor: "var(--bg-card)", borderColor: isOpen ? "var(--accent-primary)" : "var(--border-primary)" }}>
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl shrink-0 border text-center"
                            style={{ backgroundColor: p.bg, borderColor: p.border }}>
                            <span className="text-[11px] font-black leading-tight" style={{ color: p.text }}>{formatTimeAMPM(entry.startTime)}</span>
                            <div className="w-3 h-px my-0.5" style={{ backgroundColor: p.text, opacity: 0.4 }} />
                            <span className="text-[10px] font-bold leading-tight" style={{ color: "var(--text-secondary)" }}>{formatTimeAMPM(entry.endTime)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{entry.subject?.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border"
                                style={{ backgroundColor: p.bg, borderColor: p.border, color: p.text }}>
                                {entry.timetable?.batch?.name}
                              </span>
                            </div>
                            <div className="flex items-center flex-wrap gap-4 mt-1.5">
                              {entry.classroom && (
                                <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}><MapPin size={11} />{entry.classroom.name}</span>
                              )}
                              <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}><Clock size={11} />{formatTimeAMPM(entry.startTime)} — {formatTimeAMPM(entry.endTime)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                          {entry.isCanceled ? (
                            <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border border-rose-500/30 text-rose-500 bg-rose-500/10">
                              <XCircle size={14} /> Cancelled
                            </span>
                          ) : (
                            <>
                              <button onClick={() => {
                                  if (confirm('Cancel this session for today?')) {
                                    cancelSession(entry.id, todayDateStr, authToken, API_BASE || API_BASE_URL);
                                  }
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] border border-transparent hover:border-rose-500/20">
                                <X size={14} /> Cancel
                              </button>
                              <button onClick={() => handleClassGoLive(entry)}
                                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer shadow-sm hover:-translate-y-0.5`}
                                style={{ 
                                  background: isOpen ? "var(--bg-secondary)" : "var(--accent-primary)", 
                                  color: isOpen ? "var(--text-primary)" : "white", 
                                  border: isOpen ? "1px solid var(--border-primary)" : "1px solid var(--accent-primary)" 
                                }}>
                                <Radio size={14} className={isOpen ? "text-rose-500" : "animate-pulse"} />
                                {isOpen ? "Close Form" : "Start Session"}
                              </button>
                              <a href="/attendance/faculty"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5 cursor-pointer border"
                                style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-hover)", borderColor: "var(--border-primary)" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Take Attendance
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                      {isOpen && (
                        <div className="border-t px-5 pb-5" style={{ borderColor: "var(--border-primary)" }}>
                          <InlineSessionForm classEntry={entry} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unplanned Session */}
            <div className={`rounded-2xl border border-dashed border-[var(--border-primary)] overflow-hidden ${isActiveClass ? 'opacity-50 pointer-events-none' : ''}`}>
              <button onClick={handleUnplannedToggle} disabled={!!isActiveClass}
                className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-[var(--bg-secondary)] cursor-pointer disabled:cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <Sparkles size={16} style={{ color: "var(--accent-primary)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Start an Unplanned Session</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Go live outside your regular timetable</p>
                  </div>
                </div>
                <ArrowRight size={16} className={`transition-transform duration-200 ${showUnplannedForm ? "rotate-90" : ""}`} style={{ color: "var(--text-muted)" }} />
              </button>
              {showUnplannedForm && (
                <div className="border-t px-4 pb-4" style={{ borderColor: "var(--border-primary)" }}>
                  <InlineSessionForm classEntry={null} />
                </div>
              )}
            </div>
            </div>

            {/* Right Column: Broadcasts */}
            <div className="space-y-6 lg:sticky lg:top-8 h-max">
            {/* Broadcasts & Upcoming Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>Broadcasts & Upcoming</h2>
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
                <button type="button" onClick={() => setRightColumnTab("upcoming")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer border ${rightColumnTab === "upcoming" ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border-[var(--border-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                  Upcoming
                  {upcomingClasses.length > 0 && <span className="px-1.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">{upcomingClasses.length}</span>}
                </button>
                <button type="button" onClick={() => setRightColumnTab("past")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all outline-none cursor-pointer border ${rightColumnTab === "past" ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border-[var(--border-primary)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>
                  Past
                  {allPast.length > 0 && <span className="px-1.5 rounded text-[9px] font-black bg-violet-500/10 text-violet-500 border border-violet-500/20">{allPast.length}</span>}
                </button>
              </div>

              {rightColumnTab === "upcoming" ? (
                <div className="space-y-3">
                  {upcomingClasses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--border-primary)] rounded-2xl text-center space-y-1 bg-[var(--bg-card)]">
                      <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>No other classes today</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {upcomingClasses.map((entry) => (
                        <div key={entry.id} className="flex flex-col p-4 rounded-2xl border bg-[var(--bg-card)] gap-3 opacity-60 grayscale-[0.3]" style={{ borderColor: "var(--border-primary)" }}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                               <span className="text-[9px] font-black leading-tight text-amber-500">{formatTimeAMPM(entry.startTime)}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2"><h4 className="text-xs font-extrabold truncate" style={{ color: "var(--text-primary)" }}>{entry.subject?.name}</h4></div>
                              <p className="text-[10px] text-amber-500 font-semibold mt-0.5 flex items-center gap-1"><CalendarDays size={9} />{entry.timetable?.batch?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: "var(--border-primary)" }}>
                            {entry.isCanceled ? (
                              <span className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-500 text-[10px] font-extrabold uppercase flex items-center gap-1.5 flex-1 justify-center">
                                <XCircle size={11} /> Cancelled
                              </span>
                            ) : (
                              <>
                                <button type="button" onClick={() => {
                                    if (confirm('Cancel this upcoming session?')) {
                                      cancelSession(entry.id, todayDateStr, authToken, API_BASE || API_BASE_URL);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] text-[10px] font-extrabold uppercase flex items-center gap-1.5 transition-all">
                                  <X size={11} /> Cancel
                                </button>
                                <button type="button" disabled
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-white text-[10px] font-extrabold uppercase flex items-center gap-1.5 cursor-not-allowed flex-1 justify-center">
                                  <Radio size={11} />Start
                                </button>
                                <button type="button" disabled
                                  className="px-3 py-1.5 rounded-lg border bg-slate-500/10 text-slate-400 text-[10px] font-extrabold uppercase flex items-center gap-1.5 cursor-not-allowed flex-1 justify-center" style={{ borderColor: "var(--border-primary)" }}>
                                  Attendance
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {loadingPast ? (
                  <div className="flex justify-center p-6 border border-dashed border-[var(--border-primary)] rounded-2xl"><div className="w-5 h-5 rounded-full animate-spin" style={{ border: "2px solid var(--accent-primary)", borderTopColor: "transparent" }} /></div>
                ) : allPast.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--border-primary)] rounded-2xl text-center space-y-1 bg-[var(--bg-card)]">
                    <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>No past recordings found</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Your recorded sessions will appear here.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {allPast.map((past) => (
                      <div key={past.id} className="flex items-center justify-between p-4 rounded-2xl border hover:bg-[var(--bg-secondary)] gap-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                        <div className="flex items-center gap-3 min-w-0">
                          {past.thumbnailUrl ? <img src={past.thumbnailUrl} alt="" className="w-14 h-9 rounded-lg object-cover shrink-0" /> : <div className="w-14 h-9 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center shrink-0 border" style={{ borderColor: "var(--border-primary)" }}><Radio size={13} style={{ color: "var(--text-muted)" }} /></div>}
                          <div className="min-w-0">
                            <h4 className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>{past.title} <span className="text-[9px] font-normal text-[var(--text-muted)]">by {past.host?.fullName || past.host?.username || "Unknown"}</span></h4>
                            <p className="text-[10px] text-[var(--text-muted)]">{new Date(past.startedAt).toLocaleDateString()} at {new Date(past.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                            {past.endedAt && <p className="text-[9px] text-[var(--text-muted)] opacity-70">Duration: {Math.round((new Date(past.endedAt) - new Date(past.startedAt)) / 60000)} mins</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {past.recordingUrl ? (
                            <button type="button" onClick={() => { const url = past.recordingUrl.startsWith("/") ? `${API_BASE}${past.recordingUrl}` : past.recordingUrl; setSelectedVideoUrl(url); setSelectedVideoSession(past); }}
                              className="px-3 py-1.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-500 text-[10px] font-extrabold uppercase border border-zinc-500/20 cursor-pointer">Watch</button>
                          ) : (past.isRecording && (past.egressSegments || (past.endedAt && (new Date() - new Date(past.endedAt)) < 180000))) ? (
                            <span className="text-[9px] font-extrabold text-neutral-500 bg-neutral-500/10 px-2 py-1.5 rounded border border-neutral-500/20 animate-pulse">Processing...</span>
                          ) : <span className="text-[9px] font-bold text-slate-500 bg-slate-500/5 px-2 py-1.5 rounded border border-dashed border-slate-500/10">No Recording</span>}
                          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteSession(past); }}
                            className="p-1.5 rounded-lg border hover:bg-red-500/10 hover:text-red-500 text-slate-400 cursor-pointer" style={{ borderColor: "var(--border-primary)" }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>
            </div>
            </div>

        <AnimatePresence>
          {showRecordPrompt && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center space-y-4"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-badge)] flex items-center justify-center mx-auto"><Radio size={24} className="animate-pulse" style={{ color: "var(--text-accent)" }} /></div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>Record Session</h3>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Do you want to record this live stream?</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => { setShouldRecord(false); setShowRecordPrompt(false); startActualSession(); }}
                    className="px-5 py-2.5 rounded-2xl border text-xs font-bold cursor-pointer" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>No, Skip</button>
                  <button onClick={() => { setShouldRecord(true); setShowRecordPrompt(false); startActualSession(); }}
                    className="px-6 py-2.5 rounded-2xl text-white text-xs font-black uppercase shadow-lg hover:scale-[1.02] cursor-pointer" style={{ background: "var(--accent-gradient)" }}>Yes, Record</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!session || !livekitToken) {
    return (
      <>
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar pb-10 pr-1">
        <div className="max-w-7xl mx-auto space-y-12 lg:space-y-0 lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-12 animate-fade-in px-4 sm:px-6 lg:px-8">
          
          {/* Left Column: Setup Form */}
          <div className="space-y-8 max-w-2xl w-full">
        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 mb-6 shrink-0 relative" style={{ borderColor: "var(--border-primary)" }}>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif tracking-tight" style={{ color: "var(--text-primary)" }}>
              Go Live
            </h1>
            <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Start a live session for your students in real-time.
            </p>
          </div>
        </section>

        {/* Setup Form */}
        <div className="rounded-2xl border border-[var(--border-primary)] p-6 space-y-6 shadow-sm"
          style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
        >
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Session Title *
            </label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. DSA Masterclass — Trees & Graphs"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none transition-colors focus:border-[var(--text-muted)]"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
              id="session-title-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of what you'll cover..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none transition-colors focus:border-[var(--text-muted)] resize-none"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
              id="session-description-input"
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Thumbnail Image
              </label>
              <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-[var(--border-primary)] border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                16:9 Aspect Ratio • Max 10MB
              </span>
            </div>
            <div className="flex items-start gap-4">
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-40 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-zinc-500/50 hover:bg-zinc-500/5 p-2 text-center"
                style={{ borderColor: "var(--border-primary)" }}
              >
                {formState.thumbnailPreview ? (
                  <img
                    src={formState.thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <ImagePlus size={20} className="mx-auto" style={{ color: "var(--text-muted)" }} />
                    <span className="text-[10px] font-bold block" style={{ color: "var(--text-muted)" }}>
                      Upload Image
                    </span>
                    <span className="text-[8px] font-medium block opacity-75" style={{ color: "var(--text-muted)" }}>
                      16:9 • Max 10MB
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  id="thumbnail-upload"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] leading-relaxed pt-1" style={{ color: "var(--text-muted)" }}>
                Optional thumbnail that students will see before joining. Recommended: 16:9 aspect ratio, max size: 10MB.
              </p>
            </div>
          </div>

          {/* Target Cohorts (Batches) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
              Target Cohorts (Batches)
            </label>
            <div 
              className="w-full rounded-xl p-4 border border-[var(--border-primary)] grid grid-cols-1 sm:grid-cols-2 gap-2"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
              }}
            >
              {batches.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)] italic col-span-2">
                  {user?.role === "ADMIN" 
                    ? "No cohorts found. This session will be public."
                    : "No cohorts found. This session will be available to all students in your institute."}
                </span>
              ) : (
                batches.map(b => (
                  <label 
                    key={b.id} 
                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-1 hover:text-[var(--text-accent)] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedBatchIds.includes(b.id)}
                      onChange={() => {
                        setSelectedBatchIds(prev => 
                          prev.includes(b.id) 
                            ? prev.filter(id => id !== b.id) 
                            : [...prev, b.id]
                        );
                      }}
                      className="rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>{b.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-[9px] text-[var(--text-muted)] italic">
              {user?.role === "ADMIN" 
                ? "Leave all unchecked to publish this broadcast globally to all students in the world."
                : "Leave all unchecked to target all cohorts in your institute."
              }
            </p>
          </div>

          {/* Record Session Configuration */}
          <div className="space-y-4 rounded-xl p-4 border" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                  Record Session
                </label>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Automatically record this session for playback later.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shouldRecord}
                  onChange={(e) => setShouldRecord(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          {/* Watermark Configuration */}
          <div className="space-y-4 rounded-xl p-4 border" style={{ borderColor: "var(--border-primary)" }}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold uppercase tracking-wider block" style={{ color: "var(--text-secondary)" }}>
                  Show Watermark
                </label>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Add secure watermark overlay to the stream for students.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {showWatermark && (
              <div className="space-y-2 border-t border-slate-800/40 pt-3 transition-all animate-fadeIn">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Watermark Contents to Show:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-1 hover:text-[var(--text-accent)] transition-colors text-slate-300">
                    <input
                      type="checkbox"
                      checked={watermarkOpts.inst}
                      onChange={(e) => setWatermarkOpts(p => ({ ...p, inst: e.target.checked }))}
                      className="rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>Institution Name</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-1 hover:text-[var(--text-accent)] transition-colors text-slate-300">
                    <input
                      type="checkbox"
                      checked={watermarkOpts.username}
                      onChange={(e) => setWatermarkOpts(p => ({ ...p, username: e.target.checked }))}
                      className="rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>Username</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-1 hover:text-[var(--text-accent)] transition-colors text-slate-300">
                    <input
                      type="checkbox"
                      checked={watermarkOpts.email}
                      onChange={(e) => setWatermarkOpts(p => ({ ...p, email: e.target.checked }))}
                      className="rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                    />
                    <span>Email ID</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Date & Time */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
              <span>Schedule Date & Time (Optional)</span>
              <span className="text-[9px] font-bold text-[var(--text-muted)]">Select if scheduling for future</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAtDate}
              onChange={(e) => setScheduledAtDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] text-sm font-medium outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Action Buttons: Go Live Now or Schedule Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleStartSession}
              disabled={isStarting || isScheduling || !formState.title.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[var(--text-on-accent)] text-xs font-extrabold uppercase tracking-wider transition-transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "var(--accent-primary)" }}
              id="go-live-btn"
            >
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Radio size={16} />
                  Go Live Now
                </>
              )}
            </button>

            <button
              onClick={handleScheduleSession}
              disabled={isStarting || isScheduling || !formState.title.trim() || !scheduledAtDate}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--border-primary)] text-xs font-extrabold uppercase tracking-wider transition-all hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-secondary)" }}
              id="schedule-class-btn"
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-amber-500" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarDays size={16} className="text-amber-500" />
                  Schedule Class
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Status Info */}
        <div className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border-primary)] text-[10px] font-semibold"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)", color: "var(--text-muted)" }}
        >
          <Sparkles size={12} style={{ color: "var(--text-accent)" }} />
          Students will see your camera, microphone, and screen share in real-time.
        </div>
          </div>

          {/* Right Column: Scheduled & Past Broadcasts */}
          <div className="w-full lg:sticky lg:top-0 lg:h-max space-y-6">



        {/* Tab Switcher for Right Column */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm">
          <button
            type="button"
            onClick={() => setRightColumnTab("upcoming")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all outline-none focus:outline-none focus:ring-0 select-none cursor-pointer border ${
              rightColumnTab === "upcoming"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border-[var(--border-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CalendarDays size={14} className="text-amber-500" />
            <span>Upcoming Classes</span>
            {scheduledSessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {scheduledSessions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setRightColumnTab("past")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all outline-none focus:outline-none focus:ring-0 select-none cursor-pointer border ${
              rightColumnTab === "past"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border-[var(--border-primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Film size={14} className="text-violet-500" />
            <span>Past Broadcasts</span>
            {pastSessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-violet-500/10 text-violet-500 border border-violet-500/20">
                {pastSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Scheduled Classes List */}
        {rightColumnTab === "upcoming" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <CalendarDays size={17} className="text-amber-500" />
                  Upcoming Scheduled Classes
                </h2>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Classes scheduled for future broadcasts. Start them anytime.
                </p>
              </div>
            </div>

            {loadingScheduled ? (
              <div className="flex items-center justify-center p-6 border border-[var(--border-primary)] border-dashed rounded-2xl">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-accent)" }} />
              </div>
            ) : scheduledSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-[var(--border-primary)] border-dashed rounded-2xl text-center space-y-1"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}
              >
                <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>No upcoming scheduled classes</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Use the form to schedule a live class for later.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {scheduledSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[var(--border-primary)] transition-all hover:bg-[var(--bg-secondary)] gap-3 shadow-sm"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-primary)",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {s.thumbnailUrl ? (
                        <img
                          src={s.thumbnailUrl}
                          alt=""
                          className="w-14 h-9 rounded-lg object-cover bg-[var(--bg-hover)] shrink-0"
                        />
                      ) : (
                        <div
                          className="w-14 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20"
                        >
                          <CalendarDays size={14} className="text-amber-500" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Scheduled
                          </span>
                          <h4 className="text-xs font-extrabold truncate" style={{ color: "var(--text-primary)" }}>
                            {s.title}
                          </h4>
                        </div>
                        {s.description && (
                          <p className="text-[11px] line-clamp-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {s.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[10px] pt-0.5" style={{ color: "var(--text-muted)" }}>
                          <span className="flex items-center gap-1 font-semibold text-amber-500">
                            <CalendarDays size={11} />
                            {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true }) : "Scheduled"}
                          </span>
                          {s.batches && s.batches.length > 0 && (
                            <span className="truncate max-w-[120px]">
                              Cohort: {s.batches.map(b => b.name).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStartScheduledSession(s);
                        }}
                        disabled={isStarting}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                      >
                        <Radio size={12} />
                        Start Now
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteScheduledSession(s);
                        }}
                        className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
                        title="Cancel Scheduled Class"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Past Broadcasts List */
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-serif flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Film size={17} className="text-violet-500" />
                Past Broadcasts
              </h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Watch recordings, manage, and delete your previously ended live sessions.
              </p>
            </div>

            {loadingPast ? (
              <div className="flex items-center justify-center p-6 border border-[var(--border-primary)] border-dashed rounded-2xl"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-accent)" }} />
              </div>
            ) : pastSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 border border-[var(--border-primary)] border-dashed rounded-2xl text-center space-y-2"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-card)" }}
              >
                <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>No past broadcasts found</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Your ended broadcasts will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {pastSessions.map((past) => (
                  <div
                    key={past.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-primary)] transition-colors hover:bg-[var(--bg-secondary)] gap-4"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-primary)",
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {past.thumbnailUrl ? (
                        <img
                          src={past.thumbnailUrl}
                          alt=""
                          className="w-14 h-9 rounded-lg object-cover bg-[var(--bg-hover)] shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-9 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center shrink-0 border"
                          style={{ borderColor: "var(--border-primary)" }}
                        >
                          <Radio size={14} style={{ color: "var(--text-muted)" }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                          {past.title} <span className="text-[9px] font-normal text-[var(--text-muted)] opacity-80 ml-2">by {past.host?.username || 'Unknown'}</span>
                        </h4>
                        <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                          {new Date(past.startedAt).toLocaleDateString()} at {new Date(past.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {past.endedAt && (
                          <p className="text-[9px] text-[var(--text-muted)] font-semibold opacity-70 mt-0.5">
                            Duration: {Math.round((new Date(past.endedAt) - new Date(past.startedAt)) / 60000)} mins
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {past.recordingUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            const url = past.recordingUrl.startsWith('/') ? `${API_BASE}${past.recordingUrl}` : past.recordingUrl;
                            setSelectedVideoUrl(url);
                            setSelectedVideoSession(past);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-500 text-[10px] font-extrabold uppercase tracking-wider transition-all border border-zinc-500/20 hover:scale-[1.02] cursor-pointer text-center shrink-0"
                        >
                          Watch
                        </button>
                      ) : (past.isRecording && (past.egressSegments || (past.endedAt && (new Date() - new Date(past.endedAt)) < 180000))) ? (
                        <span className="text-[9px] font-extrabold text-neutral-500 bg-neutral-500/10 px-2 py-1.5 rounded border border-neutral-500/20 animate-pulse shrink-0">
                          Processing...
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-500/5 px-2 py-1.5 rounded border border-dashed border-slate-500/10 shrink-0">
                          No Recording
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteSession(past);
                        }}
                        className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
                        title="Delete Past Broadcast"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
          </div>
        </div>

      {/* Recording Prompt Modal Overlay */}
      <AnimatePresence>
        {showRecordPrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-[var(--border-primary)] shadow-2xl p-6 text-center space-y-4"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-badge)] text-[var(--text-accent)] flex items-center justify-center mx-auto">
                <Radio size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  Record Session
                </h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Do you want to record this live stream session?
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShouldRecord(false);
                    setShowRecordPrompt(false);
                    startActualSession();
                  }}
                  className="px-5 py-2.5 rounded-2xl border border-[var(--border-primary)] text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-[var(--bg-hover)]/60 cursor-pointer"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
                >
                  No, Skip
                </button>
                <button
                  onClick={() => {
                    setShouldRecord(true);
                    setShowRecordPrompt(false);
                    startActualSession();
                  }}
                  className="px-6 py-2.5 rounded-2xl text-[var(--text-on-accent)] text-xs font-black uppercase transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  Yes, Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Secure Video Modal Player */}
        {selectedVideoUrl && (
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedVideoUrl(null)}
          >
            <div 
              className="relative w-full max-w-4xl rounded-2xl border border-[var(--border-primary)] border-[var(--border-primary)] bg-[var(--bg-card)]/95 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)] bg-[var(--bg-card)]/50">
                <span className="text-xs font-bold text-slate-300">Session Playback</span>
                <button 
                  onClick={() => setSelectedVideoUrl(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Video Container */}
              <div 
                ref={containerRef}
                className={isFullscreen ? "relative w-full h-full bg-black flex items-center justify-center group" : "relative aspect-video bg-black flex items-center justify-center group"}
              >
                <video
                  ref={videoRef}
                  src={selectedVideoUrl}
                  autoPlay
                  crossOrigin="anonymous"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={handlePlayPause}
                  className="w-full h-full object-contain cursor-pointer"
                />
                {/* Custom controls overlay at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 pointer-events-auto">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-1.5 transition-all"
                    style={{
                      background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${(currentTime / (duration || 1)) * 100}%, rgba(51, 65, 85, 0.6) ${(currentTime / (duration || 1)) * 100}%, rgba(51, 65, 85, 0.6) 100%)`
                    }}
                  />
                  <div className="flex items-center justify-between text-white text-xs select-none">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handlePlayPause}
                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <span className="font-mono text-[10px] text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={handleToggleMute}
                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        style={{
                          background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${(isMuted ? 0 : volume) * 100}%, rgba(51, 65, 85, 0.6) ${(isMuted ? 0 : volume) * 100}%, rgba(51, 65, 85, 0.6) 100%)`
                        }}
                      />
                      <button 
                        onClick={toggleFullscreen}
                        className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer ml-1"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Dynamic Watermark Overlay */}
                {user && selectedVideoSession?.showWatermark && (() => {
                  const watermarkOptsArray = selectedVideoSession?.watermarkOptions?.split(',') || ["inst", "username", "email"];
                  const showInst = watermarkOptsArray.includes("inst");
                  const showUsername = watermarkOptsArray.includes("username");
                  const showEmail = watermarkOptsArray.includes("email");

                  return (
                    <div 
                      className="absolute z-10 pointer-events-none select-none text-slate-100 font-mono text-[9px] sm:text-xs bg-slate-950/20 backdrop-blur-[1px] px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] border-white/5 opacity-[0.16] shadow-sm"
                      style={{
                        top: watermarkPos.top,
                        left: watermarkPos.left,
                        transition: "top 2s ease-in-out, left 2s ease-in-out"
                      }}
                    >
                      {showInst && (user.institute?.name || user.role === "ADMIN") && (
                        <div className="text-[7px] sm:text-[9px] font-bold opacity-70 tracking-widest uppercase mb-0.5">
                          {user.role === "ADMIN" ? "EduVantix" : user.institute.name}
                        </div>
                      )}
                      {showUsername && (
                        <div className="font-black uppercase tracking-wider">{user.username}</div>
                      )}
                      {showEmail && (
                        <div className="text-[7px] sm:text-[9px] font-bold opacity-80 mt-0.5">{user.email}</div>
                      )}
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
      {/* Custom Modal: Start Scheduled Session */}
      {startConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Start Live Class Now?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Are you sure you want to start <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{startConfirmSession.title}"</span>? Students will be notified and can join the broadcast immediately.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStartConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = startConfirmSession;
                  setStartConfirmSession(null);
                  executeStartScheduledSession(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal: Delete/Cancel Scheduled Session */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Cancel Scheduled Class?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Are you sure you want to cancel <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{deleteConfirmSession.title}"</span>? This class will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Keep Class
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deleteConfirmSession.id;
                  setDeleteConfirmSession(null);
                  executeDeleteScheduledSession(targetId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal: Delete Past Broadcast */}
      {deletePastConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Delete Past Broadcast?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                This will permanently delete <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{deletePastConfirmSession.title}"</span> recording and data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeletePastConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deletePastConfirmSession.id;
                  setDeletePastConfirmSession(null);
                  executeDeleteSession(targetId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Past Broadcasts & Recordings */}
      {showPastModal && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-[var(--border-primary)] shadow-2xl overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]"
              style={{ borderColor: "var(--border-primary)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/20">
                  <Film size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif" style={{ color: "var(--text-primary)" }}>
                    Past Broadcasts & Recordings
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Watch recorded streams and manage past live sessions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPastModal(false)}
                className="p-2 rounded-xl border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body List */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {loadingPast ? (
                <div className="flex items-center justify-center p-12">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--text-accent)" }} />
                </div>
              ) : pastSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl text-center space-y-2"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <Film size={32} className="opacity-40 text-slate-400" />
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>No past broadcasts found</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Your ended live sessions and recorded broadcasts will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pastSessions.map((past) => (
                    <div
                      key={past.id}
                      className="flex items-center justify-between p-4 rounded-2xl border transition-colors hover:bg-[var(--bg-secondary)] gap-4"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-primary)",
                      }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {past.thumbnailUrl ? (
                          <img
                            src={past.thumbnailUrl}
                            alt=""
                            className="w-16 h-10 rounded-xl object-cover bg-[var(--bg-hover)] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-10 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center shrink-0 border"
                            style={{ borderColor: "var(--border-primary)" }}
                          >
                            <Radio size={16} style={{ color: "var(--text-muted)" }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                            {past.title} <span className="text-[9px] font-normal text-[var(--text-muted)] opacity-80 ml-2">by {past.host?.username || 'Unknown'}</span>
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                            {new Date(past.startedAt).toLocaleDateString()} at {new Date(past.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {past.endedAt && (
                            <p className="text-[9px] text-[var(--text-muted)] font-semibold opacity-70 mt-0.5">
                              Duration: {Math.round((new Date(past.endedAt) - new Date(past.startedAt)) / 60000)} mins
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {past.recordingUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              const url = past.recordingUrl.startsWith('/') ? `${API_BASE}${past.recordingUrl}` : past.recordingUrl;
                              setSelectedVideoUrl(url);
                              setSelectedVideoSession(past);
                              setShowPastModal(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-500 text-[10px] font-extrabold uppercase tracking-wider transition-all border border-zinc-500/20 hover:scale-[1.02] cursor-pointer text-center shrink-0"
                          >
                            Watch
                          </button>
                        ) : (past.isRecording && (past.egressSegments || (past.endedAt && (new Date() - new Date(past.endedAt)) < 180000))) ? (
                          <span className="text-[9px] font-extrabold text-neutral-500 bg-neutral-500/10 px-2 py-1.5 rounded border border-neutral-500/20 animate-pulse shrink-0">
                            Processing...
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-500/5 px-2 py-1.5 rounded border border-dashed border-slate-500/10 shrink-0">
                            No Recording
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteSession(past);
                          }}
                          className="p-1.5 rounded-lg border border-[var(--border-primary)] hover:bg-red-500/10 hover:text-red-500 text-slate-400 transition-colors cursor-pointer"
                          title="Delete Past Broadcast"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // ─── Active Session (Broadcasting) ─────────────────────────────────
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden px-4 sm:px-6 py-3">
      <button
        type="button"
        onClick={handleBackToPortal}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg border border-[var(--border-primary)] text-xs font-bold leading-none transition-all hover:scale-[1.02] cursor-pointer shrink-0 w-fit"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-primary)",
          color: "var(--text-primary)",
        }}
      >
        <ArrowLeft size={14} />
        Back to Admin Portal
      </button>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {LIVEKIT_URL ? (
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={livekitToken}
          connect={true}
          video={true}
          audio={true}
          style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}
        >
          <BroadcastPanel session={session} onEndSession={handleEndSession} authToken={authToken} shouldRecord={shouldRecord} />
        </LiveKitRoom>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-[var(--border-primary)] text-center space-y-4"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
        >
          <WifiOff size={48} className="opacity-30" style={{ color: "var(--text-muted)" }} />
          <div className="space-y-1">
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>LiveKit Not Configured</h3>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Set the <code className="px-1.5 py-0.5 rounded bg-slate-500/10 font-mono text-[10px]">NEXT_PUBLIC_LIVEKIT_URL</code> environment variable to connect.
            </p>
          </div>
        </div>
      )}
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}>
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto border border-[var(--border-primary)] border-orange-500/20">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black" style={{ color: "var(--text-primary)" }}>End Live Session?</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {pendingEndAction === "portal" 
                  ? "Leaving will end the active live session for all students. Continue?" 
                  : "Are you sure you want to end this live session?"}
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                Cancel
              </button>
              <button type="button" 
                onClick={async () => { 
                  setShowEndConfirm(false); 
                  const ended = await endActiveSession(); 
                  if (ended && pendingEndAction === "portal") {
                    router.push("/admin/dashboard");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer">
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal: Start Scheduled Session */}
      {startConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Start Live Class Now?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Are you sure you want to start <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{startConfirmSession.title}"</span>? Students will be notified and can join the broadcast immediately.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStartConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = startConfirmSession;
                  setStartConfirmSession(null);
                  executeStartScheduledSession(target);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal: Delete/Cancel Scheduled Session */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Cancel Scheduled Class?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Are you sure you want to cancel <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{deleteConfirmSession.title}"</span>? This class will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Keep Class
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deleteConfirmSession.id;
                  setDeleteConfirmSession(null);
                  executeDeleteScheduledSession(targetId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal: Delete Past Broadcast */}
      {deletePastConfirmSession && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-6 border border-[var(--border-primary)] shadow-2xl text-center space-y-5"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={22} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Delete Past Broadcast?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                This will permanently delete <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{deletePastConfirmSession.title}"</span> recording and data. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeletePastConfirmSession(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-hover)]"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = deletePastConfirmSession.id;
                  setDeletePastConfirmSession(null);
                  executeDeleteSession(targetId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Tab Termination Overlay */}
      {isDuplicateTab && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl p-8 border border-[var(--border-primary)] shadow-2xl text-center space-y-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-primary)" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                Session Active in Another Tab
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                This live broadcast session was opened in a newer tab of your browser. To prevent broadcast and media conflicts, session controls in this tab have been terminated.
              </p>
            </div>
            <button
              type="button"
              onClick={claimActiveTab}
              className="w-full py-3.5 rounded-xl text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
              style={{ background: "var(--accent-gradient)" }}
            >
              Re-claim Broadcast in This Tab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
