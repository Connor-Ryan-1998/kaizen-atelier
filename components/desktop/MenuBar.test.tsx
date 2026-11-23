import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BOOKING_URL } from "@/lib/site";
import { Desktop } from "./Desktop";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

afterEach(() => vi.restoreAllMocks());

test("Services menu item opens the Services window at that service", async () => {
  const push = vi.spyOn(window.history, "pushState");
  render(<Desktop />);
  await userEvent.click(screen.getByRole("button", { name: "Services", expanded: false }));
  await userEvent.click(screen.getByRole("menuitem", { name: "Data pipelines" }));
  expect(screen.getByRole("dialog", { name: "Services" })).toBeInTheDocument();
  expect(push).toHaveBeenCalledWith(null, "", "/services#pipelines");
});

test("Book a call opens the booking page in a new tab", () => {
  render(<Desktop />);
  const link = screen.getByRole("link", { name: "Book a call" });
  expect(link).toHaveAttribute("href", BOOKING_URL);
  expect(link).toHaveAttribute("target", "_blank");
});

test("Work menu lists case studies, process and pricing", async () => {
  render(<Desktop />);
  await userEvent.click(screen.getByRole("button", { name: "Work" }));
  const items = within(screen.getByRole("menu")).getAllByRole("menuitem").map((i) => i.textContent);
  expect(items).toEqual(["Case studies", "How I work", "Pricing"]);
});

test("Escape closes an open menu", async () => {
  render(<Desktop />);
  await userEvent.click(screen.getByRole("button", { name: "More" }));
  expect(screen.getByRole("menu")).toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
});
