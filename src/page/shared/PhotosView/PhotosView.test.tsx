import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhotosView } from "@/page/shared/PhotosView";
import type { PhotoYearGroup } from "@/entities/photo";

const groups: PhotoYearGroup[] = [
  {
    year: 2025,
    photos: [
      {
        id: 1,
        url: "https://example.com/a.jpg",
        createdAt: "2025-01-01T00:00:00.000Z",
        year: 2025,
        userId: 1,
      },
      {
        id: 2,
        url: "https://example.com/b.jpg",
        createdAt: "2025-02-01T00:00:00.000Z",
        year: 2025,
        userId: 1,
      },
    ],
  },
  {
    year: 2026,
    photos: [
      {
        id: 3,
        url: "https://example.com/c.jpg",
        createdAt: "2026-01-01T00:00:00.000Z",
        year: 2026,
        userId: 1,
      },
    ],
  },
];

describe("PhotosView", () => {
  it("renders title and year sections without upload CTA", () => {
    render(<PhotosView yearGroups={groups} />);

    expect(screen.getByTestId("photos-view")).toBeInTheDocument();
    expect(screen.getByText("Мои фотографии")).toBeInTheDocument();
    expect(screen.queryByTestId("photos-upload-btn")).not.toBeInTheDocument();
    expect(screen.getByTestId("photos-year-2025")).toBeInTheDocument();
    expect(screen.getByTestId("photos-year-2026")).toBeInTheDocument();
    expect(screen.getAllByTestId("photo-card")).toHaveLength(3);
  });

  it("calls onPhotoClick when a card is clicked", () => {
    const onPhotoClick = vi.fn();
    render(<PhotosView yearGroups={groups} onPhotoClick={onPhotoClick} />);

    fireEvent.click(screen.getAllByTestId("photo-card")[0]);
    expect(onPhotoClick).toHaveBeenCalledWith(groups[0].photos[0]);
  });

  it("shows empty state when there are no photos", () => {
    render(<PhotosView yearGroups={[]} />);
    expect(screen.getByTestId("photos-empty")).toBeInTheDocument();
  });
});
