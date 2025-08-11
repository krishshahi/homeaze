import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Common selectors
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector(state => state.auth.user);
export const useServices = () => useAppSelector((state) => state.services);
export const useBookings = () => useAppSelector((state) => state.booking);
export const useApp = () => useAppSelector((state) => state.app);
export const useDashboard = () => useAppSelector((state) => state.dashboard);
export const useProfile = () => useAppSelector((state) => state.user);
