import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, token, loading, error } = useSelector((state) => state.auth);

  const performLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    isAuthenticated,
    token,
    loading,
    error,
    isAdmin: user?.role === 'admin',
    performLogout
  };
};
