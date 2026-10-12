// ─── Constants ────────────────────────────────────────────────────────
export const SPRING_CONFIG = { stiffness: 150, damping: 20, mass: 0.5 };
export const SPRING_SNAPPY = { stiffness: 300, damping: 30, mass: 0.3 };
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

// ─── Contact & WhatsApp Configuration ─────────────────────────────────
// Phone number in international format without '+' or dashes (e.g. 917795857717)
export const WHATSAPP_PHONE_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "917795857717";

export const SUPPORT_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 7795857717";

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi eduvantix! I'm interested in your AI & tech courses and would love to know more.";