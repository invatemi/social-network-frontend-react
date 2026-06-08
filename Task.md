# ROLE
Act as a Senior Fullstack Engineer (React/TypeScript + Node.js/Express/Prisma). You are an expert in building scalable social network architectures, optimizing database queries, and creating seamless UI/UX with React hooks.

# CONTEXT
We are integrating the frontend pages of a social network with the backend `user-service`. 
The backend uses Prisma (PostgreSQL), Express, and is routed through a KrakenD API Gateway. RabbitMQ is used for event-driven architecture.
I will provide the current backend code, KrakenD config, and the paths to the frontend files that need to be implemented/refactored.

# TASK
Your goal is to bridge the frontend pages (`FollowerPage`, `FriendPage`, `PublicPage`, `UserDetailPage`, `UserPage`) with the backend. 
1. Update the Frontend API layers and React hooks to consume the backend endpoints efficiently.
2. Identify missing backend logic required for these pages (like pagination, search, relation statuses) and implement or instruct how to implement them.

# EXPLICIT REQUIREMENTS
## Frontend Implementation:
- **API Layer (`src/entities/.../api`)**: Create strictly typed API functions matching the KrakenD routes. Ensure proper error handling.
- **Hooks (`src/feature/.../hooks`)**: 
  - Implement data fetching (assume React Query / SWR or standard `useEffect` with caching).
  - For lists (followers, friends), implement **infinite scrolling** or pagination logic.
  - For mutations (follow, unfriend, send request), implement **optimistic updates** and proper cache invalidation.
  - Handle loading, error, and empty states gracefully.

## Backend Adaptations (CRITICAL):
The current backend lacks crucial features for the UI to work correctly. You must implement the following in the backend (or provide exact refactoring instructions if you cannot modify files directly):
1. **Pagination**: Add cursor-based pagination (`limit`, `cursor`) to `getFollowers`, `getFollowing`, `getFriends`, `getIncomingRequests`, `getOutgoingRequests`.
2. **Search**: Create a new endpoint `GET /api/users/search?q={query}` for `useUserSearch`.
3. **Relation Status**: Create `GET /api/users/{id}/relation` (protected) that returns an aggregated object: `{ isFriend, isFollowing, isFollowedBy, hasIncomingRequest, hasOutgoingRequest }`. This is critical for rendering action buttons on `PublicPage`.
4. Update `krakend.json` to expose these new/modified endpoints.

# ADAPTIVE
- If you cannot directly modify the backend files, provide explicit, step-by-step instructions and TypeScript/Prisma code snippets on how to refactor `followers.service.ts`, `friends.service.ts`, and `endpoints.ts`.
- If the backend pagination is not yet implemented, write the frontend hooks to support it but include a fallback/warning.

# REFLECTIVE
Before outputting the final code, review your solution against this checklist:
1. Are all list endpoints paginated to prevent memory issues and slow UI on large follower counts?
2. Does the `Relation Status` endpoint cover all possible states between two users to prevent multiple redundant API calls from the frontend?
3. Are cache invalidations correctly handled in the backend after mutations?
4. Are there any hardcoded URLs or missing error handling in the frontend hooks?
5. Did I cover all requested frontend files (`useCreateFriend`, `useUserProfile`, `useUserSearch`, `useAvatarUpload`, `usePasswordNavigation`, `useProfileSave`, `useUserDetailForm`)?

# INPUT DATA
[AI, I will now attach the backend code, KrakenD config, and the contents of the frontend files listed above. Please begin your analysis and implementation.]