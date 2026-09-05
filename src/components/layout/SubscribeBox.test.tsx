import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscribeBox from "@/components/layout/SubscribeBox";

const statusMock = vi.fn();
const subscribeMock = vi.fn();

let authState: { user: { email: string } | null; loading: boolean } = {
  user: null,
  loading: false,
};
let loggedIn = false;

vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/auth/token", () => ({
  isLoggedIn: () => loggedIn,
}));

vi.mock("@/lib/api", () => ({
  ApiError: class ApiError extends Error {},
  newsletterApi: {
    status: (...args: unknown[]) => statusMock(...args),
    subscribe: (...args: unknown[]) => subscribeMock(...args),
  },
}));

describe("SubscribeBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { user: null, loading: false };
    loggedIn = false;
    statusMock.mockResolvedValue({ subscribed: false, email: null });
    subscribeMock.mockResolvedValue({
      alreadySubscribed: false,
      subscribedAt: "2026-08-29T00:00:00.000Z",
    });
  });

  it("未登录：展示登录引导，且不请求订阅状态", async () => {
    render(<SubscribeBox />);

    expect(
      await screen.findByRole("link", { name: "Sign in to subscribe" }),
    ).toHaveAttribute("href", "/signin");
    expect(statusMock).not.toHaveBeenCalled();
  });

  it("加载中：渲染骨架占位", () => {
    loggedIn = true;
    authState = { user: { email: "a@b.com" }, loading: true };
    statusMock.mockReturnValue(new Promise(() => {}));

    const { container } = render(<SubscribeBox />);

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByLabelText("Email")).toBeNull();
  });

  it("已登录未订阅：回填只读邮箱，提交时带上蜜罐字段", async () => {
    loggedIn = true;
    authState = { user: { email: "a@b.com" }, loading: false };

    render(<SubscribeBox />);

    const input = await screen.findByLabelText("Email");
    expect(input).toHaveValue("a@b.com");
    expect(input).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() =>
      expect(subscribeMock).toHaveBeenCalledWith({
        email: "a@b.com",
        companyWebsite: "",
      }),
    );
  });

  it("已登录已订阅：展示邮箱快照，不渲染表单", async () => {
    loggedIn = true;
    authState = { user: { email: "a@b.com" }, loading: false };
    statusMock.mockResolvedValue({ subscribed: true, email: "a@b.com" });

    render(<SubscribeBox />);

    expect(await screen.findByText("a@b.com")).toBeInTheDocument();
    expect(screen.getByText(/Subscribed/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).toBeNull();
  });

  it("提交成功后重拉状态并切换到已订阅态", async () => {
    loggedIn = true;
    authState = { user: { email: "a@b.com" }, loading: false };
    statusMock
      .mockResolvedValueOnce({ subscribed: false, email: null })
      .mockResolvedValueOnce({ subscribed: true, email: "a@b.com" });

    render(<SubscribeBox />);

    await screen.findByLabelText("Email");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() =>
      expect(screen.getByText(/Subscribed/)).toBeInTheDocument(),
    );
    expect(statusMock).toHaveBeenCalledTimes(2);
  });

  it("提交失败：展示错误信息且停留在表单", async () => {
    loggedIn = true;
    authState = { user: { email: "a@b.com" }, loading: false };
    subscribeMock.mockRejectedValue(new Error("boom"));

    render(<SubscribeBox />);

    await screen.findByLabelText("Email");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network error, please try again later",
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
