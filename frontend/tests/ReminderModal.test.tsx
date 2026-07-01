import { render, screen, fireEvent } from "@testing-library/react";
import ReminderModal from "../src/components/ReminderModal";

describe("ReminderModal", () => {
  it("does not close on backdrop click and supports three actions", () => {
    const onComplete = vi.fn();
    const onExtend = vi.fn();
    const onAbandon = vi.fn();
    render(
      <ReminderModal
        open={true}
        title="晨跑"
        mode="strict"
        onComplete={onComplete}
        onExtend={onExtend}
        onAbandon={onAbandon}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /完成/i }));
    expect(onComplete).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /再给 1 小时/i }));
    expect(onExtend).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /放弃/i }));
    expect(onAbandon).toHaveBeenCalled();
  });
});
