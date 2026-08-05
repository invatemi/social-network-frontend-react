import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SettingsModal } from "./ui/SettingsModal";
import { AddAccountModal } from "./ui/AddAccountModal";

type ProfileSettingsContextValue = {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isAddAccountOpen: boolean;
  openAddAccount: () => void;
  closeAddAccount: () => void;
};

const ProfileSettingsContext = createContext<ProfileSettingsContextValue | null>(
  null
);

type ProfileSettingsProviderProps = {
  children: ReactNode;
};

/**
 * ProfileSettingsProvider — единая точка открытия SettingsModal и AddAccountModal
 */
export const ProfileSettingsProvider = ({
  children,
}: ProfileSettingsProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);
  const openAddAccount = useCallback(() => setIsAddAccountOpen(true), []);
  const closeAddAccount = useCallback(() => setIsAddAccountOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      openSettings,
      closeSettings,
      isAddAccountOpen,
      openAddAccount,
      closeAddAccount,
    }),
    [
      isOpen,
      openSettings,
      closeSettings,
      isAddAccountOpen,
      openAddAccount,
      closeAddAccount,
    ]
  );

  return (
    <ProfileSettingsContext.Provider value={value}>
      {children}
      <SettingsModal isOpen={isOpen} onClose={closeSettings} />
      <AddAccountModal isOpen={isAddAccountOpen} onClose={closeAddAccount} />
    </ProfileSettingsContext.Provider>
  );
};

export const useProfileSettings = (): ProfileSettingsContextValue => {
  const ctx = useContext(ProfileSettingsContext);
  if (!ctx) {
    throw new Error(
      "useProfileSettings must be used within ProfileSettingsProvider"
    );
  }
  return ctx;
};
