import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../src/pages/LoginPage";

describe("LoginPage", () => {
  it("anonymous login button triggers login and navigates", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /匿名体验/i }));
    await waitFor(() => {
      expect(localStorage.getItem("yanshi_token")).toBe("mock-token");
    });
  });
});
