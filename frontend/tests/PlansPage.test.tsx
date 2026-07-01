import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlansPage from "../src/pages/PlansPage";

describe("PlansPage", () => {
  it("creates a new plan and shows it in the list", async () => {
    render(
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/计划目标/i), { target: { value: "晨跑 5 公里" } });
    fireEvent.change(screen.getByPlaceholderText(/完成标准/i), { target: { value: "GPS >= 5km" } });
    fireEvent.change(screen.getByLabelText(/截止时间/i), { target: { value: "2026-07-10T08:00" } });
    fireEvent.click(screen.getByRole("button", { name: /创建计划/i }));
    await waitFor(() => {
      expect(screen.getByText("晨跑 5 公里")).toBeInTheDocument();
    });
  });
});
