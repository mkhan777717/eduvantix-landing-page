import { create } from 'zustand';

export const useTimetableStore = create((set, get) => ({
  todayClasses: [],
  batchTimetables: [],
  isLoading: false,
  error: null,

  fetchTodayClasses: async (role, token, API_BASE) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = role === 'USER' ? '/api/timetables/student/today' : '/api/timetables/faculty/today';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ todayClasses: data.data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchBatchTimetable: async (batchId, token, API_BASE) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/timetables/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        set({ batchTimetables: data.data || [], isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
