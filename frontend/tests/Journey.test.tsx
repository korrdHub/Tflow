import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

describe("Full MVP journey", () => {
  it("anonymous login -> create plan -> see dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /匿名体验/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /仪表盘/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/计划管理/i));
    fireEvent.change(screen.getByPlaceholderText(/计划目标/i), { target: { value: "晨跑" } });
    fireEvent.change(screen.getByPlaceholderText(/完成标准/i), { target: { value: "GPS 5km" } });
    fireEvent.change(screen.getByLabelText(/截止时间/i), { target: { value: "2026-07-10T08:00" } });
    fireEvent.click(screen.getByRole("button", { name: /创建计划/i }));
    await waitFor(() => {
      expect(screen.getByText("晨跑")).toBeInTheDocument();
    });
  });
});
