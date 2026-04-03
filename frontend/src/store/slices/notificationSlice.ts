import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async () => {
    const response = await api.get('/notifications');
    return response.data;
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string) => {
    await api.post(`/notifications/read/${id}`);
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    await api.post('/notifications/read-all');
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => { n.isRead = true; });
        state.unreadCount = 0;
      });
  }
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;