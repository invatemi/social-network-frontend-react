import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PresenceState = {
  /** userId -> online */
  byUserId: Record<string, boolean>;
};

const initialState: PresenceState = {
  byUserId: {},
};

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    setUserOnline: (state, action: PayloadAction<number>) => {
      state.byUserId[String(action.payload)] = true;
    },
    setUserOffline: (state, action: PayloadAction<number>) => {
      state.byUserId[String(action.payload)] = false;
    },
    setPresenceStatuses: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      Object.assign(state.byUserId, action.payload);
    },
    clearPresence: (state) => {
      state.byUserId = {};
    },
  },
});

export const {
  setUserOnline,
  setUserOffline,
  setPresenceStatuses,
  clearPresence,
} = presenceSlice.actions;

/** Per-user presence — avoids ChatList re-render on unrelated online/offline. */
export const selectIsUserOnline = (
  state: { presence: PresenceState },
  userId: number | null | undefined
): boolean =>
  userId != null && userId > 0
    ? state.presence.byUserId[String(userId)] === true
    : false;

export default presenceSlice.reducer;
