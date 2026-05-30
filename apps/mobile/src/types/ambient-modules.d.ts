declare module "expo-secure-store" {
  export function setItemAsync(key: string, value: string): Promise<void>;
  export function getItemAsync(key: string): Promise<string | null>;
  export function deleteItemAsync(key: string): Promise<void>;
  const SecureStore: {
    setItemAsync: typeof setItemAsync;
    getItemAsync: typeof getItemAsync;
    deleteItemAsync: typeof deleteItemAsync;
  };
  export default SecureStore;
}

declare module "@react-native-async-storage/async-storage" {
  export function setItem(key: string, value: string): Promise<void>;
  export function getItem(key: string): Promise<string | null>;
  export function removeItem(key: string): Promise<void>;
  const AsyncStorage: {
    setItem: typeof setItem;
    getItem: typeof getItem;
    removeItem: typeof removeItem;
  };
  export default AsyncStorage;
}
