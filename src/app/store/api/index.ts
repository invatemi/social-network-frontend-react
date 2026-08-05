export { baseApi } from "./baseApi";

export {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokensMutation,
  useLogoutMutation,
  useGetAccountsQuery,
  useLazyGetAccountsQuery,
  useAddAccountMutation,
  useSwitchAccountMutation,
} from "./authApi";

export {
  useRequestPasswordCodeMutation,
  useVerifyPasswordCodeMutation,
} from "./codeApi";

export {
  useGetFriendRequestsQuery
} from "./notificationsApi.ts"
