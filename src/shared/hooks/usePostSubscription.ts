/**
 * Post updates are delivered globally via WebSocket (registerSocketHandlers).
 * Per-post room subscriptions are not used.
 */
export const usePostSubscription = (_postId: number | undefined) => {
  // No-op: socket handlers invalidate post/comment caches globally.
};
