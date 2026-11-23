import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Desktop } from "./Desktop";

vi.mock("next/navigation", () => ({ usePathname: () => "/services" }));

test("route window is open on first render", () => {
  render(<Desktop />);
  expect(screen.getByRole("dialog", { name: "Services" })).toBeInTheDocument();
});

test("close button removes the window", async () => {
  render(<Desktop />);
  await userEvent.click(screen.getByRole("button", { name: "Close Services" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Services" })).toBeNull());
});

test("Escape inside a window closes it", async () => {
  render(<Desktop />);
  const dialog = screen.getByRole("dialog", { name: "Services" });
  dialog.focus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Services" })).toBeNull());
});

test("icon opens a window once, even when clicked twice", async () => {
  render(<Desktop />);
  const icon = screen.getByRole("button", { name: /About me/ });
  await userEvent.click(icon);
  await userEvent.click(icon);
  expect(screen.getAllByRole("dialog", { name: "About me" })).toHaveLength(1);
  expect(within(screen.getByRole("dialog", { name: "About me" })).getByRole("heading")).toBeInTheDocument();
});
