import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";

// A helper component to expose useAuth values for testing
const TestConsumer = () => {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? "authenticated" : "unauthenticated"}</p>
      <p data-testid="user-name">{user?.name || "none"}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("provides unauthenticated state by default", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("auth-status").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("user-name").textContent).toBe("none");
  });

  it("restores user from localStorage on mount", () => {
    const mockUser = { id: "1", name: "Test User", email: "test@test.com", role: "student" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", "fake-token-123");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");
    expect(screen.getByTestId("user-name").textContent).toBe("Test User");
  });

  it("clears user and localStorage on logout", async () => {
    const mockUser = { id: "1", name: "Test User", email: "test@test.com", role: "student" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("token", "fake-token-123");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Verify user is loaded
    expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");

    // Click logout
    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("unauthenticated");
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("throws error when useAuth is used outside of AuthProvider", () => {
    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );

    consoleSpy.mockRestore();
  });
});
