import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderInDesk } from "@/components/desktop/testUtils";
import { DemoWindow } from "./DemoWindow";
import { HomelabWindow } from "./HomelabWindow";
import { NotFoundWindow } from "./NotFoundWindow";
import { PipelinesWindow } from "./PipelinesWindow";
import { TrashWindow } from "./TrashWindow";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

test("Trash reveals a quip for a deleted file", async () => {
  renderInDesk(<TrashWindow />);
  await userEvent.click(screen.getByRole("button", { name: "just_use_excel.xlsx" }));
  expect(screen.getByText("Restored 47 times.")).toBeInTheDocument();
});

test("Trash cannot be emptied", async () => {
  renderInDesk(<TrashWindow />);
  await userEvent.click(screen.getByRole("button", { name: "Empty trash" }));
  expect(screen.getByText("Permission denied. Some things are forever.")).toBeInTheDocument();
});

test("Demo without a video id buffers forever and has no iframe", () => {
  const { container } = renderInDesk(<DemoWindow />);
  expect(screen.getByText("buffering… (forever)")).toBeInTheDocument();
  expect(container.querySelector("iframe")).toBeNull();
});

test("Demo with a video id embeds youtube-nocookie", () => {
  const { container } = renderInDesk(<DemoWindow videoId="abc123" />);
  expect(container.querySelector("iframe")).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc123");
});

test("Homelab shows the spaghetti topology with credit and Wikipedia link", () => {
  renderInDesk(<HomelabWindow />);
  expect(screen.getByRole("img").getAttribute("alt")).toBeTruthy();
  expect(screen.getByRole("link", { name: /Spaghetti — Wikipedia/ })).toHaveAttribute(
    "href",
    "https://en.wikipedia.org/wiki/Spaghetti",
  );
  expect(screen.getByText(/^Photo:/)).toBeInTheDocument();
});

test("Pipelines shows the original plumber scene and caption", () => {
  renderInDesk(<PipelinesWindow />);
  expect(screen.getByRole("img", { name: /pipeline engineers/i })).toBeInTheDocument();
  expect(screen.getByText("Two certified pipeline engineers inspecting your ETL.")).toBeInTheDocument();
});

test("404 links back to the desktop", () => {
  renderInDesk(<NotFoundWindow />);
  expect(screen.getByRole("link", { name: "Back to desktop" })).toHaveAttribute("href", "/");
});
