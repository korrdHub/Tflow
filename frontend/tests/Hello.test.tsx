import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App", () => {
  it("renders the app title", () => {
    render(<App />);
    expect(screen.getByText(/严师APP/i)).toBeInTheDocument();
  });
});
