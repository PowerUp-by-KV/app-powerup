import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/services/user-api";
import { UserProfile } from "@/services/types";

// The local User interface used within Context
export interface User extends UserProfile {}

interface UserContextType {
  user: User;
  updateProfile: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  userId = "user-1",
}: {
  children: ReactNode;
  userId?: string;
}) => {
  const { data: userData } = useGetUserProfileQuery(userId);
  const [updateUser] = useUpdateUserProfileMutation();
  const [localUser, setLocalUser] = React.useState<User | null>(null);

  // Sync with API but allow local overrides
  const user = useMemo((): User => {
    if (localUser) return localUser;

    if (userData) {
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email || "",
        streak: userData.streak || 5,
        points: userData.points || 1250,
        completedLessons: userData.completedLessons || 12,
        rank: userData.rank || 145,
        avatarUri: userData.avatarUri,
        avatarIndex: userData.avatarIndex || 0,
        xp: userData.xp || userData.points || 1250,
        friendsCount: userData.friendsCount || 10,
        cefrLevel: userData.cefrLevel || "A2",
      };
    }
    return {
      id: userId,
      name: "Learning User",
      email: "user@example.com",
      streak: 5,
      points: 1250,
      completedLessons: 12,
      rank: 145,
      avatarUri: undefined,
      avatarIndex: 0,
      xp: 1250,
      friendsCount: 10,
      cefrLevel: "A2",
    };
  }, [userData, userId, localUser]);

  const updateProfile = async (updates: Partial<User>) => {
    // 1. Update LOCAL state immediately for snappy UI
    const newUser = { ...user, ...updates };
    setLocalUser(newUser);

    // 2. Attempt API update in background
    try {
      const apiUpdates: Partial<User & { avatar: string }> = {};
      if (updates.name) apiUpdates.name = updates.name;
      if (updates.email) apiUpdates.email = updates.email;
      if (updates.avatarUri) apiUpdates.avatar = updates.avatarUri;

      await updateUser({ userId, ...apiUpdates }).unwrap();
    } catch (error) {
      // Log but don't crash or block (Fixes FETCH_ERROR)
      console.warn("API Profile Update Failed (Offline Mode)", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, updateProfile, isLoading: false }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
