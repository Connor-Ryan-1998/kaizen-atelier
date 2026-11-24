import { render, screen } from "@testing-library/react";
import { WorkshopScene } from "./WorkshopScene";

test("renders a decorative, non-interactive image", () => {
  const { container } = render(<WorkshopScene />);
  const img = container.querySelector("img[data-workshop]")!;
  expect(img).toHaveAttribute("src", "/desk/workshop.svg");
  expect(img).toHaveAttribute("alt", "");
  expect(img).toHaveAttribute("aria-hidden", "true");
  expect(img).toHaveAttribute("draggable", "false");
  expect(img).toHaveClass("pointer-events-none", "hidden", "roomy:block");
});

test("is not exposed to assistive tech", () => {
  render(<WorkshopScene />);
  expect(screen.queryByRole("img")).toBeNull();
});
