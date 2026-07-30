import { describe, it, expect } from "vitest";
import { groupPhotosByYear, type PhotoItem } from "@/entities/photo";

describe("groupPhotosByYear", () => {
  it("groups photos by year ascending", () => {
    const photos: PhotoItem[] = [
      {
        id: 1,
        url: "a",
        createdAt: "2026-01-02T00:00:00.000Z",
        year: 2026,
        userId: 1,
      },
      {
        id: 2,
        url: "b",
        createdAt: "2025-06-01T00:00:00.000Z",
        year: 2025,
        userId: 1,
      },
      {
        id: 3,
        url: "c",
        createdAt: "2026-03-01T00:00:00.000Z",
        year: 2026,
        userId: 1,
      },
    ];

    const groups = groupPhotosByYear(photos);
    expect(groups.map((g) => g.year)).toEqual([2025, 2026]);
    expect(groups[1].photos.map((p) => p.id)).toEqual([3, 1]);
  });
});
