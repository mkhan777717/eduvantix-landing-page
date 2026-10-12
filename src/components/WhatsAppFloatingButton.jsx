"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WHATSAPP_PHONE_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@/utils/constants";

export default function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [initialPulse, setInitialPulse] = useState(true);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      setInitialPulse(false);
    }, 5000);

    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (window.scrollY > 80) setHasScrolled(true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!mounted) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_DEFAULT_MESSAGE
  )}`;

  const handleClick = () => {
    // Fire Google Analytics event if GA4 is loaded
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "whatsapp_chat_click", {
        event_category: "Engagement",
        event_label: "WhatsApp Floating FAB",
        phone: WHATSAPP_PHONE_NUMBER,
      });
    }
  };

  const isTooltipVisible = isHovered || initialPulse;

  return (
    <div
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-3 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip / Label */}
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            initial={{ opacity: 0, x: 14, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full shadow-2xl backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] bg-white/95 dark:bg-[#121620]/95 hover:border-[#25D366]/40 cursor-pointer transition-all duration-200"
            style={{
              boxShadow:
                "0 12px 32px -4px rgba(0, 0, 0, 0.16), 0 0 1px 1px rgba(37, 211, 102, 0.2)",
            }}
          >
            {/* Live pulsing online beacon */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                Chat with us
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                Typically replies in minutes
              </span>
            </div>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label="Chat with eduvantix on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: hasScrolled ? 0 : [0, -4, 0],
        }}
        transition={{
          scale: { type: "spring", stiffness: 350, damping: 20 },
          opacity: { duration: 0.3 },
          y: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          },
        }}
        whileHover={{
          scale: 1.08,
          boxShadow:
            "0 15px 35px -5px rgba(37, 211, 102, 0.55), 0 6px 15px -2px rgba(18, 140, 126, 0.4)",
        }}
        whileTap={{ scale: 0.94 }}
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full text-white cursor-pointer overflow-visible transition-colors duration-200"
        style={{
          background:
            "linear-gradient(135deg, #2bf776 0%, #25D366 50%, #128C7E 100%)",
          boxShadow:
            "0 10px 28px -4px rgba(37, 211, 102, 0.45), 0 4px 12px rgba(0, 0, 0, 0.12)",
          border: "1.5px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        {/* Ambient breathing ripple */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none animate-ping"
          style={{
            background: "rgba(37, 211, 102, 0.35)",
            animationDuration: "3s",
          }}
        />

        {/* Gloss highlight overlay */}
        <span
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        {/* WhatsApp Official SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 md:w-8 md:h-8 fill-current relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
          aria-hidden="true"
        >
          <path d="M16.002 2C8.28 2 2 8.28 2 16.002c0 2.525.672 4.992 1.947 7.158L2 30l7.009-1.895A13.924 13.924 0 0016.002 30C23.72 30 30 23.72 30 16.002 30 8.28 23.72 2 16.002 2zm0 25.597c-2.28 0-4.512-.61-6.467-1.764l-.463-.274-4.8 1.298 1.306-4.678-.301-.48A11.536 11.536 0 014.404 16c0-6.396 5.202-11.597 11.598-11.597 6.395 0 11.596 5.201 11.596 11.597 0 6.396-5.201 11.597-11.596 11.597zm6.36-8.683c-.348-.174-2.06-1.016-2.38-1.132-.32-.116-.552-.174-.784.174-.232.348-.899 1.132-1.102 1.364-.203.232-.406.261-.754.087-.348-.174-1.47-.542-2.8-1.728-1.036-.924-1.735-2.066-1.938-2.414-.203-.348-.022-.536.152-.71.157-.156.348-.406.522-.61.174-.203.232-.348.348-.58.116-.232.058-.435-.029-.61-.087-.174-.784-1.888-1.074-2.585-.283-.679-.57-.587-.784-.598-.203-.011-.435-.013-.667-.013-.232 0-.61.087-.929.435-.32.348-1.22 1.192-1.22 2.907 0 1.715 1.249 3.371 1.423 3.603.174.232 2.457 3.752 5.952 5.261.832.359 1.482.574 1.988.735.836.265 1.596.228 2.197.138.67-.1 2.06-.842 2.351-1.654.29-.812.29-1.509.203-1.654-.087-.145-.319-.232-.667-.406z" />
        </svg>

        {/* Small live notification beacon dot on the button */}
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white dark:border-neutral-900" />
        </span>
      </motion.a>
    </div>
  );
}
