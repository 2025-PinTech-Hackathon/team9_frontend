import { createContext, useContext } from 'react';
import { useUserInfo } from '../hooks/useUserInfo';

const UserContext = createContext();

export function UserProvider({ children }) {
  const userInfoData = useUserInfo();

  return (
    <UserContext.Provider value={userInfoData}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 