import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SettingsModal } from "./ui/SettingsModal";

type ProfileSettingsContextValue = {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const ProfileSettingsContext = createContext<ProfileSettingsContextValue | null>(
  null
);

type ProfileSettingsProviderProps = {
  children: ReactNode;
};

/**
 * ProfileSettingsProvider — единая точка открытия SettingsModal
 */
export const ProfileSettingsProvider = ({
  children,
}: ProfileSettingsProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openSettings, closeSettings }),
    [isOpen, openSettings, closeSettings]
  );

  return (
    <ProfileSettingsContext.Provider value={value}>
      {children}
      <SettingsModal isOpen={isOpen} onClose={closeSettings} />
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
