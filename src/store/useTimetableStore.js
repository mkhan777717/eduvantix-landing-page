import { create } from 'zustand';

export const useTimetableStore = create((set, get) => ({
  todayClasses: [],
  batchTimetables: [],
  isLoading: false,
  error: null,

  fetchTodayClasses: async (role, token, API_BASE, day = null) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = role === 'USER' ? '/api/timetables/student/today' : '/api/timetables/faculty/today';
      const url = day !== null ? `${endpoint}?day=${day}` : endpoint;
      const res = await fetch(`${API_BASE}${url}`, {
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
  },

  cancelSession: async (entryId, date, token, API_BASE) => {
    try {
      const res = await fetch(`${API_BASE}/api/timetables/entry/${entryId}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state so it immediately disappears or shows as canceled
        set((state) => ({
          todayClasses: state.todayClasses.map(c => 
            c.id === entryId 
              ? { ...c, canceledDates: data.entry.canceledDates } 
              : c
          )
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}));
