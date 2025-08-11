import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import servicesSlice from './slices/servicesSlice';
import bookingSlice from './slices/bookingSlice';
import appSlice from './slices/appSlice';
import paymentSlice from './slices/paymentSlice';
import reviewSlice from './slices/reviewSlice';
import dashboardSlice from './slices/dashboardSlice';
import quoteSlice from './slices/quoteSlice';
import chatSlice from './slices/chatSlice';
import locationSlice from './slices/locationSlice';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
