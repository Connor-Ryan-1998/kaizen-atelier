import { screen } from "@testing-library/react";
import { renderInDesk } from "@/components/desktop/testUtils";
import { BOOKING_EMBED_URL, BOOKING_URL, LINKEDIN_URL, MAILTO } from "@/lib/site";
import { ContactWindow } from "./ContactWindow";
import { CvWindow } from "./CvWindow";

const isDesktop = vi.hoisted(() => ({ value: true }));
vi.mock("@/components/desktop/useIsDesktop", () => ({ useIsDesktop: () => isDesktop.value }));

test("Contact on desktop embeds the calendar and offers email + LinkedIn", () => {
  isDesktop.value = true;
  renderInDesk(<ContactWindow />);
  expect(screen.getByTitle("Book a call with Connor")).toHaveAttribute("src", BOOKING_EMBED_URL);
  expect(screen.getByRole("link", { name: /hq2831@gmail\.com/ })).toHaveAttribute("href", MAILTO);
  expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", LINKEDIN_URL);
  expect(screen.getByRole("link", { name: /Open it in a new tab/ })).toHaveAttribute("href", BOOKING_URL);
});

test("Contact on phones has no iframe, just the booking button", () => {
  isDesktop.value = false;
  const { container } = renderInDesk(<ContactWindow />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: "Book a call" })).toHaveAttribute("href", BOOKING_URL);
});

test("CV points to LinkedIn", () => {
  renderInDesk(<CvWindow />);
  expect(screen.getByRole("link", { name: "View on LinkedIn" })).toHaveAttribute("href", LINKEDIN_URL);
});

