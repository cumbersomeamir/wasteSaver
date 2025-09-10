import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Location, LocationPermission } from '@/types';
import { LocationService } from '@/services/LocationService';

interface LocationState {
  location: Location | null;
  permission: LocationPermission | null;
  isLoading: boolean;
  error: string | null;
  watchId: number | null;
  isWatching: boolean;
}

const initialState: LocationState = {
  location: null,
  permission: null,
  isLoading: false,
  error: null,
  watchId: null,
  isWatching: false,
};

// Async thunks
export const requestLocationPermission = createAsyncThunk(
  'location/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      const permission = await LocationService.requestPermissions();
      return permission;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Permission request failed');
    }
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const location = await LocationService.getCurrentLocation();
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current location');
    }
  }
);

export const startLocationWatching = createAsyncThunk(
  'location/startWatching',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const watchId = LocationService.watchPosition((location: Location) => {
        dispatch(setLocation(location));
      });
      return watchId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start location watching');
    }
  }
);

export const stopLocationWatching = createAsyncThunk(
  'location/stopWatching',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const watchId = state.location.watchId;
      if (watchId) {
        await LocationService.clearWatch(watchId);
      }
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to stop location watching');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => {
      state.location = action.payload;
      state.error = null;
    },
    setPermission: (state, action: PayloadAction<LocationPermission>) => {
      state.permission = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearLocation: (state) => {
      state.location = null;
      state.permission = null;
      state.error = null;
      state.watchId = null;
      state.isWatching = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Permission
      .addCase(requestLocationPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permission = action.payload;
        state.error = null;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Current Location
      .addCase(getCurrentLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.location = action.payload;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Start Watching
      .addCase(startLocationWatching.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startLocationWatching.fulfilled, (state, action) => {
        state.isLoading = false;
        state.watchId = action.payload;
        state.isWatching = true;
        state.error = null;
      })
      .addCase(startLocationWatching.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Stop Watching
      .addCase(stopLocationWatching.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(stopLocationWatching.fulfilled, (state) => {
        state.isLoading = false;
        state.watchId = null;
        state.isWatching = false;
      })
      .addCase(stopLocationWatching.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLocation,
  setPermission,
  clearError,
  setLoading,
  clearLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
