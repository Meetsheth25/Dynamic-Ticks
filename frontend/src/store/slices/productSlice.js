import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

const initialState = {
  products: [],
  productDetails: null,
  loading: false,
  error: null,
  reviews: [],
  reviewsLoading: false,
  reviewsError: null,
  reviewSuccess: false,
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/products');
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchProductReviews',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/reviews/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await api.post('/reviews', reviewData);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    clearReviewSuccess: (state) => {
      state.reviewSuccess = false;
      state.reviewsError = null;
    }
  },
  extraReducers: (builder) => {
    // FETCH ALL
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // FETCH DETAILS
    builder.addCase(fetchProductDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.productDetails = action.payload;
    });
    builder.addCase(fetchProductDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // FETCH REVIEWS
    builder.addCase(fetchProductReviews.pending, (state) => {
      state.reviewsLoading = true;
      state.reviewsError = null;
    });
    builder.addCase(fetchProductReviews.fulfilled, (state, action) => {
      state.reviewsLoading = false;
      state.reviews = action.payload;
    });
    builder.addCase(fetchProductReviews.rejected, (state, action) => {
      state.reviewsLoading = false;
      state.reviewsError = action.payload;
    });

    // CREATE REVIEW
    builder.addCase(createProductReview.pending, (state) => {
      state.reviewsLoading = true;
      state.reviewsError = null;
      state.reviewSuccess = false;
    });
    builder.addCase(createProductReview.fulfilled, (state) => {
      state.reviewsLoading = false;
      state.reviewSuccess = true;
    });
    builder.addCase(createProductReview.rejected, (state, action) => {
      state.reviewsLoading = false;
      state.reviewsError = action.payload;
    });
  }
});

export const { clearProductDetails, clearReviewSuccess } = productSlice.actions;

export default productSlice.reducer;
