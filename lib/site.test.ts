import * as site from "./site";

test("site constants", () => {
  expect(site.BOOKING_URL).toBe("https://calendar.app.google/5HCocotfMXvcyh3V8");
  expect(site.BOOKING_EMBED_URL).toMatch(
    /^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\/.+\?gv=true$/,
  );
  expect(site.LINKEDIN_URL).toBe("https://www.linkedin.com/in/connormartinryan/");
  expect(site.MAILTO).toBe("mailto:hq2831@gmail.com?subject=Project%20Request");
  expect(site.DEMO_VIDEO_ID).toBeNull();
});
