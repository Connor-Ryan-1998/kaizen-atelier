import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInDesk } from "@/components/desktop/testUtils";
import { BOOKING_URL, LINKEDIN_URL } from "@/lib/site";
import { AboutWindow } from "./AboutWindow";
import { PricingWindow } from "./PricingWindow";
import { ProcessWindow } from "./ProcessWindow";
import { ServicesWindow } from "./ServicesWindow";
import { WelcomeWindow } from "./WelcomeWindow";
import { WorkWindow } from "./WorkWindow";

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  window.location.hash = "";
});

test("a service hash highlights and scrolls to that card", () => {
  window.location.hash = "#analytics";
  const { container } = renderInDesk(<ServicesWindow />);
  const card = container.querySelector("#analytics")!;
  expect(card).toHaveAttribute("data-highlighted", "true");
  expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
});

test("all four service cards exist with spec ids", () => {
  const { container } = renderInDesk(<ServicesWindow />);
  for (const id of ["automation", "pipelines", "analytics", "infrastructure"]) {
    expect(container.querySelector(`#${id}`)).not.toBeNull();
  }
});

test.each([
  ["Welcome", WelcomeWindow],
  ["Services", ServicesWindow],
  ["Work", WorkWindow],
  ["Process", ProcessWindow],
  ["About", AboutWindow],
  ["Pricing", PricingWindow],
])("%s window leaks no [bracketed] placeholders", (_, Win) => {
  const { container } = renderInDesk(<Win />);
  expect(container.textContent).not.toMatch(/\[[^\]]+\]/);
  expect(container.textContent!.length).toBeGreaterThan(40);
});

test("Welcome: book links to calendar, 'See what I do' opens Services", async () => {
  const { api } = renderInDesk(<WelcomeWindow />);
  expect(screen.getByRole("link", { name: "Book a free chat" })).toHaveAttribute("href", BOOKING_URL);
  await userEvent.click(screen.getByRole("button", { name: "See what I do" }));
  expect(api.open).toHaveBeenCalledWith("services");
});

test("Work shows the empty folder", () => {
  renderInDesk(<WorkWindow />);
  expect(screen.getByText("0 items")).toBeInTheDocument();
});

test("About links to LinkedIn", () => {
  renderInDesk(<AboutWindow />);
  expect(screen.getByRole("link", { name: /More on LinkedIn/ })).toHaveAttribute("href", LINKEDIN_URL);
});
