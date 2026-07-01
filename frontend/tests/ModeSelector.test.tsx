import { render, screen, fireEvent } from "@testing-library/react";
import ModeSelector from "../src/components/ModeSelector";

describe("ModeSelector", () => {
  it("calls onChange with selected mode", () => {
    const onChange = vi.fn();
    render(<ModeSelector value="moderate" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText(/时刻提醒型/i));
    expect(onChange).toHaveBeenCalledWith("strict");
  });
});
