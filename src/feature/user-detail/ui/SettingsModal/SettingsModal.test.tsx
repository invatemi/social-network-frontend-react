import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsModal from "./SettingsModal";

const requestCodeMock = vi.fn();
const changePasswordMock = vi.fn();
const goToRequestStepMock = vi.fn();
const saveProfileMock = vi.fn();
const openFilePickerMock = vi.fn();

let passwordStep: "request" | "verify" = "request";

vi.mock("@/shared/config/env", () => ({
  env: {
    ui: {
      profileMessageTimeoutMs: 1000,
      profileRedirectDelayMs: 100,
    },
  },
}));

vi.mock("@/feature/profile", () => ({
  useUserProfile: () => ({
    user: {
      id: 1,
      username: "Sandrs",
      email: "sandrs@mail.ru",
      bio: "hello",
      location: "Moscow",
      avatarUrl: null,
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../useUserDetailForm", () => ({
  useUserDetailForm: () => ({
    username: "Sandrs",
    email: "sandrs@mail.ru",
    bio: "hello",
    location: "Moscow",
    setUsername: vi.fn(),
    setEmail: vi.fn(),
    setBio: vi.fn(),
    setLocation: vi.fn(),
    isProfileChanged: false,
  }),
}));

vi.mock("../../useAvatarUpload", () => ({
  useAvatarUpload: () => ({
    avatarPreview: null,
    avatarFile: null,
    openFilePicker: openFilePickerMock,
    handleFileChange: vi.fn(),
    reset: vi.fn(),
    error: null,
    fileInputRef: { current: null },
  }),
}));

vi.mock("../../useProfileSave", () => ({
  useProfileSave: () => ({
    isSaving: false,
    saveError: null,
    saveSuccess: null,
    saveProfile: saveProfileMock,
    clearMessages: vi.fn(),
  }),
}));

vi.mock("../../useChangePassword", () => ({
  useChangePassword: () => ({
    step: passwordStep,
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
    setVerificationCode: vi.fn(),
    setNewPassword: vi.fn(),
    setConfirmPassword: vi.fn(),
    codeError: undefined,
    passwordError: undefined,
    confirmError: undefined,
    error: null,
    success: null,
    isRequesting: false,
    isVerifying: false,
    isLoading: false,
    email: "sandrs@mail.ru",
    requestCode: requestCodeMock,
    changePassword: changePasswordMock,
    goToRequestStep: goToRequestStepMock,
    clearMessages: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("SettingsModal", () => {
  beforeEach(() => {
    passwordStep = "request";
    requestCodeMock.mockReset();
    changePasswordMock.mockReset();
    goToRequestStepMock.mockReset();
    saveProfileMock.mockReset();
    openFilePickerMock.mockReset();
    requestCodeMock.mockResolvedValue(undefined);
  });

  it("renders nothing when closed", () => {
    render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
  });

  it("renders profile fields and blur overlay when open", () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    expect(screen.getByTestId("settings-modal-overlay")).toBeInTheDocument();
    expect(screen.getByText("Настройки")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Никнейм")).toHaveValue("Sandrs");
    expect(screen.getByPlaceholderText("Email")).toHaveValue("sandrs@mail.ru");
    expect(screen.getByPlaceholderText("Статус")).toHaveValue("hello");
    expect(screen.getByPlaceholderText("Локация")).toHaveValue("Moscow");
    expect(screen.getByText("Сохранить изменения")).toBeInTheDocument();
    expect(screen.getByText("Сменить пароль")).toBeInTheDocument();
  });

  it("requests password code from request step", () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Отправить код"));
    expect(requestCodeMock).toHaveBeenCalledTimes(1);
  });

  it("shows verify form when password step is verify", () => {
    passwordStep = "verify";
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText("0000")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("минимум 8 символов")).toBeInTheDocument();
    expect(screen.getByText("Сохранить пароль")).toBeInTheDocument();
  });

  it("closes on overlay click", () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("settings-modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
