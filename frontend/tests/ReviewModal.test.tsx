import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewModal from "../src/components/ReviewModal";

describe("ReviewModal", () => {
  it("requires reason when not completed", async () => {
    const onSubmitted = vi.fn();
    render(<ReviewModal open={true} planId="plan-1" onSubmitted={onSubmitted} />);
    fireEvent.click(screen.getByLabelText(/未完成/i));
    fireEvent.click(screen.getByRole("button", { name: /提交复盘/i }));
    await waitFor(() => {
      expect(screen.getByText(/必须填写原因/i)).toBeInTheDocument();
    });
  });
});
