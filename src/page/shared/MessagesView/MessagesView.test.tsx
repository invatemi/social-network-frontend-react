import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessagesView } from "@/page/shared/MessagesView";

describe("MessagesView", () => {
  it("renders idle sidebar without thread/details", () => {
    render(
      <MessagesView
        hasActiveChat={false}
        isMobileSidebarOpen={false}
        onCloseMobileSidebar={vi.fn()}
        sidebarHeader={<span>Сообщения</span>}
        sidebarList={<div>chat-list</div>}
      />
    );

    expect(screen.getByTestId("messages-view")).toHaveAttribute(
      "data-active",
      "false"
    );
    expect(screen.getByTestId("messages-sidebar")).toBeInTheDocument();
    expect(screen.queryByTestId("messages-thread")).not.toBeInTheDocument();
    expect(screen.queryByTestId("messages-details")).not.toBeInTheDocument();
    expect(screen.queryByTestId("messages-overlay")).not.toBeInTheDocument();
  });

  it("renders three zones when a chat is active", () => {
    render(
      <MessagesView
        hasActiveChat={true}
        isMobileSidebarOpen={false}
        onCloseMobileSidebar={vi.fn()}
        sidebarHeader={<span>Сообщения</span>}
        sidebarList={<div>chat-list</div>}
        thread={<div>thread</div>}
        details={<div>details</div>}
      />
    );

    expect(screen.getByTestId("messages-view")).toHaveAttribute(
      "data-active",
      "true"
    );
    expect(screen.getByTestId("messages-thread")).toHaveTextContent("thread");
    expect(screen.getByTestId("messages-details")).toHaveTextContent("details");
  });

  it("shows overlay when mobile sidebar is open with active chat", () => {
    const onClose = vi.fn();
    render(
      <MessagesView
        hasActiveChat={true}
        isMobileSidebarOpen={true}
        onCloseMobileSidebar={onClose}
        sidebarHeader={<span>Сообщения</span>}
        sidebarList={<div>chat-list</div>}
        thread={<div>thread</div>}
        details={<div>details</div>}
      />
    );

    const overlay = screen.getByTestId("messages-overlay");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
