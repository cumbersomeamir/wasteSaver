import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RescueBag, RescueBagFilters, Location, PaginatedResponse } from '@/types';
import { RescueBagService } from '@/services/RescueBagService';

interface RescueBagState {
  bags: RescueBag[];
  featuredBags: RescueBag[];
  nearbyBags: RescueBag[];
  favorites: string[];
  filters: RescueBagFilters;
  currentLocation: Location | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
  lastFetchTime: number | null;
}

const initialState: RescueBagState = {
  bags: [],
  featuredBags: [],
  nearbyBags: [],
  favorites: [],
  filters: {
    sortBy: 'distance',
    radius: 10,
  },
  currentLocation: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasMore: false,
  },
  lastFetchTime: null,
};

// Async thunks
export const fetchRescueBags = createAsyncThunk(
  'rescueBags/fetchBags',
  async (params: { location: Location; filters?: RescueBagFilters; page?: number }, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.getRescueBags({
        ...params,
        filters: params.filters || {},
        page: params.page || 1,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rescue bags');
    }
  }
);

export const fetchFeaturedBags = createAsyncThunk(
  'rescueBags/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.getFeaturedBags();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch featured bags');
    }
  }
);

export const fetchNearbyBags = createAsyncThunk(
  'rescueBags/fetchNearby',
  async (location: Location, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.getNearbyBags(location);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch nearby bags');
    }
  }
);

export const fetchRescueBagById = createAsyncThunk(
  'rescueBags/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.getRescueBagById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rescue bag');
    }
  }
);

export const searchRescueBags = createAsyncThunk(
  'rescueBags/search',
  async (params: { query: string; location: Location; filters?: RescueBagFilters }, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.searchRescueBags(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Search failed');
    }
  }
);

export const refreshRescueBags = createAsyncThunk(
  'rescueBags/refresh',
  async (params: { location: Location; filters?: RescueBagFilters }, { rejectWithValue }) => {
    try {
      const response = await RescueBagService.getRescueBags({
        ...params,
        filters: params.filters || {},
        page: 1,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh rescue bags');
    }
  }
);

export const loadMoreRescueBags = createAsyncThunk(
  'rescueBags/loadMore',
  async (params: { location: Location; filters?: RescueBagFilters; page: number }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentBags = state.rescueBags.bags;
      const response = await RescueBagService.getRescueBags(params);
      return { ...response, existingBags: currentBags };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load more rescue bags');
    }
  }
);

const rescueBagSlice = createSlice({
  name: 'rescueBags',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<RescueBagFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'distance',
        radius: 10,
      };
    },
    setCurrentLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const bagId = action.payload;
      const index = state.favorites.indexOf(bagId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(bagId);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearBags: (state) => {
      state.bags = [];
      state.nearbyBags = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
        hasMore: false,
      };
    },
    updateBagStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const { id, status } = action.payload;
      const bag = state.bags.find(b => b._id === id);
      if (bag) {
        bag.status = status as any;
      }
      const featuredBag = state.featuredBags.find(b => b._id === id);
      if (featuredBag) {
        featuredBag.status = status as any;
      }
      const nearbyBag = state.nearbyBags.find(b => b._id === id);
      if (nearbyBag) {
        nearbyBag.status = status as any;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rescue Bags
      .addCase(fetchRescueBags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRescueBags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bags = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(fetchRescueBags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Featured Bags
      .addCase(fetchFeaturedBags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedBags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredBags = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedBags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Nearby Bags
      .addCase(fetchNearbyBags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyBags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyBags = action.payload;
        state.error = null;
      })
      .addCase(fetchNearbyBags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh Rescue Bags
      .addCase(refreshRescueBags.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshRescueBags.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.bags = action.payload.data;
        state.pagination = action.payload.pagination;
        state.lastFetchTime = Date.now();
        state.error = null;
      })
      .addCase(refreshRescueBags.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload as string;
      })
      // Load More Rescue Bags
      .addCase(loadMoreRescueBags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadMoreRescueBags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bags = [...action.payload.existingBags, ...action.payload.data];
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadMoreRescueBags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search Rescue Bags
      .addCase(searchRescueBags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRescueBags.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bags = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(searchRescueBags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentLocation,
  toggleFavorite,
  clearError,
  clearBags,
  updateBagStatus,
} = rescueBagSlice.actions;

export default rescueBagSlice.reducer;
