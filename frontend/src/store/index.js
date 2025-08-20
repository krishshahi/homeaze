import { configureStore } from '@reduxjs/toolkit';

import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import chatSlice from './slices/chatSlice';
import dashboardSlice from './slices/dashboardSlice';
import locationSlice from './slices/locationSlice';
import paymentSlice from './slices/paymentSlice';
import quoteSlice from './slices/quoteSlice';
import reviewSlice from './slices/reviewSlice';
import servicesSlice from './slices/servicesSlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    services: servicesSlice,
    booking: bookingSlice,
    app: appSlice,
    payment: paymentSlice,
    review: reviewSlice,
    dashboard: dashboardSlice,
    quotes: quoteSlice,
    chat: chatSlice,
    location: locationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript type exports removed for JavaScript compatibility
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
