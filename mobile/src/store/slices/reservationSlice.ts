import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Reservation, ReservationStatus } from '@/types';
import { ReservationService } from '@/services/ReservationService';

interface ReservationState {
  reservations: Reservation[];
  activeReservations: Reservation[];
  history: Reservation[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

const initialState: ReservationState = {
  reservations: [],
  activeReservations: [],
  history: [],
  isLoading: false,
  isCreating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasMore: false,
  },
};

// Async thunks
export const fetchReservations = createAsyncThunk(
  'reservations/fetch',
  async (params: { page?: number; status?: ReservationStatus }, { rejectWithValue }) => {
    try {
      const response = await ReservationService.getReservations(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservations');
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/create',
  async (params: { rescueBagId: string; quantity: number; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await ReservationService.createReservation(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create reservation');
    }
  }
);

export const updateReservation = createAsyncThunk(
  'reservations/update',
  async (params: { id: string; updates: Partial<Reservation> }, { rejectWithValue }) => {
    try {
      const response = await ReservationService.updateReservation(params.id, params.updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update reservation');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ReservationService.cancelReservation(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel reservation');
    }
  }
);

export const confirmPickup = createAsyncThunk(
  'reservations/confirmPickup',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await ReservationService.confirmPickup(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to confirm pickup');
    }
  }
);

export const fetchReservationHistory = createAsyncThunk(
  'reservations/fetchHistory',
  async (params: { page?: number }, { rejectWithValue }) => {
    try {
      const response = await ReservationService.getReservationHistory(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch reservation history');
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateReservationStatus: (state, action: PayloadAction<{ id: string; status: ReservationStatus }>) => {
      const { id, status } = action.payload;
      const reservation = state.reservations.find(r => r._id === id);
      if (reservation) {
        reservation.status = status;
      }
      const activeReservation = state.activeReservations.find(r => r._id === id);
      if (activeReservation) {
        activeReservation.status = status;
        if (status === 'picked-up' || status === 'cancelled') {
          state.activeReservations = state.activeReservations.filter(r => r._id !== id);
          state.history.unshift(activeReservation);
        }
      }
    },
    clearReservations: (state) => {
      state.reservations = [];
      state.activeReservations = [];
      state.history = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasMore: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload.data;
        state.activeReservations = action.payload.data.filter(r => 
          ['pending', 'confirmed'].includes(r.status)
        );
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isCreating = false;
        state.reservations.unshift(action.payload);
        state.activeReservations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update Reservation
      .addCase(updateReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.reservations.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
        const activeIndex = state.activeReservations.findIndex(r => r._id === action.payload._id);
        if (activeIndex !== -1) {
          state.activeReservations[activeIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const reservation = state.reservations.find(r => r._id === action.payload._id);
        if (reservation) {
          reservation.status = 'cancelled';
        }
        state.activeReservations = state.activeReservations.filter(r => r._id !== action.payload._id);
        state.history.unshift(action.payload);
        state.error = null;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Confirm Pickup
      .addCase(confirmPickup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPickup.fulfilled, (state, action) => {
        state.isLoading = false;
        const reservation = state.reservations.find(r => r._id === action.payload._id);
        if (reservation) {
          reservation.status = 'picked-up';
        }
        state.activeReservations = state.activeReservations.filter(r => r._id !== action.payload._id);
        state.history.unshift(action.payload);
        state.error = null;
      })
      .addCase(confirmPickup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch History
      .addCase(fetchReservationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReservationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReservationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  updateReservationStatus,
  clearReservations,
} = reservationSlice.actions;

export default reservationSlice.reducer;
