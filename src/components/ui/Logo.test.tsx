import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Logo from "@/components/ui/Logo";

describe("Logo", () => {
  it("renders a link pointing to the home page", () => {
    render(<Logo />);
    const link = screen.getByRole("link", { name: "Cruip" });
    expect(link).toHaveAttribute("href", "/");
  });

  it("uses the provided gradient id so multiple logos can coexist", () => {
    const { container } = render(<Logo id="footer-logo" />);
    const gradient = container.querySelector("#footer-logo");
    expect(gradient).not.toBeNull();
    expect(gradient?.tagName.toLowerCase()).toBe("radialgradient");
  });

  it("accepts a custom href", () => {
    render(<Logo href="/about" />);
    expect(screen.getByRole("link", { name: "Cruip" })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
