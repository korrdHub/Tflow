import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

describe("App", () => {
  it("renders the app title", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/严师APP/i)).toBeInTheDocument();
  });
});
