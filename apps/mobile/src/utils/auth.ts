import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/(auth)/splash');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { logout };
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};
