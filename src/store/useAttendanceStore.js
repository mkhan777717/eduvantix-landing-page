import { create } from 'zustand';

export const useAttendanceStore = create((set, get) => ({
  liveSession: null,
  studentHistory: [],
  isLoading: false,
  error: null,

  generateSession: async (timetableEntryId, token, API_BASE) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/attendance/session/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ timetableEntryId })
      });
      const data = await res.json();
      if (data.success) {
        set({ liveSession: data.data, isLoading: false });
        return data.data;
      } else {
        set({ error: data.message, isLoading: false });
        throw new Error(data.message);
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchSessionStatus: async (sessionId, token, API_BASE) => {
    try {
      const res = await fetch(`${API_BASE}/api/attendance/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ liveSession: data.data });
      }
    } catch (err) {
      console.error("Failed to fetch live session status", err);
    }
  },

  fetchStudentHistory: async (token, API_BASE) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/attendance/history/student`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ studentHistory: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  checkIn: async (qrToken, token, API_BASE) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken })
      });
      const data = await res.json();
      set({ isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  }
}));
