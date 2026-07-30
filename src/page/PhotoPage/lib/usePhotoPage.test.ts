import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePhotoPage } from "./usePhotoPage";

vi.mock("@/entities/photo", async () => {
  const actual = await vi.importActual<typeof import("@/entities/photo")>(
    "@/entities/photo"
  );
  return {
    ...actual,
    useGetMyPhotosQuery: () => ({
      data: [
        {
          id: 10,
          userId: 1,
          url: "https://example.com/avatar.jpg",
          isCurrent: true,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          createdAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
    }),
    useDeletePhotoMutation: () => [vi.fn(), { isLoading: false }],
  };
});

describe("usePhotoPage", () => {
  it("maps API photos into year groups", () => {
    const { result } = renderHook(() => usePhotoPage());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.yearGroups[0]?.year).toBe(2026);
    expect(result.current.yearGroups[0]?.photos[0]?.url).toContain("avatar.jpg");
  });
});
