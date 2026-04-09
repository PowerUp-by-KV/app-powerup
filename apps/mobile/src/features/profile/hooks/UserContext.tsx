import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the User interface based on usage in HomeScreen and other components
export interface User {
  id: string;
  name: string;
  email: string;
  streak: number;
  points: number;
  completedLessons: number;
  rank: number;
  avatarUri?: string;
  avatarIndex?: number;
}

// Placeholder for MOCK_USER since the file was not found
const MOCK_USER: User = {
  id: "1",
  name: "Learning User",
  email: "user@example.com",
  streak: 5,
  points: 1250,
  completedLessons: 12,
  rank: 145,
  avatarUri: undefined,
  avatarIndex: 0,
};

interface UserContextType {
  user: User;
  updateProfile: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(MOCK_USER);

  const updateProfile = (updates: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return <UserContext.Provider value={{ user, updateProfile }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
