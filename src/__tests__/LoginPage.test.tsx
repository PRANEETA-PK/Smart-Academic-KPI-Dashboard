import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "../pages/LoginPage";

// Mock the AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: false, message: "Invalid credentials" }),
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
    token: null,
  }),
}));

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("LoginPage", () => {
  it("renders the login form heading", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Academic KPI System")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("renders Sign In button by default", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders Quick Login buttons for all three roles", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Student Demo")).toBeInTheDocument();
    expect(screen.getByText("Faculty Demo")).toBeInTheDocument();
    expect(screen.getByText("Admin Demo")).toBeInTheDocument();
  });

  it("toggles between Sign In and Sign Up modes", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Initially should say Sign In
    expect(screen.getByText("Sign in to your dashboard")).toBeInTheDocument();

    // Click the "Sign Up" toggle
    fireEvent.click(screen.getByText("Sign Up"));

    // Now it should say Create your account
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("renders the Google Sign-In button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("fills credentials when Quick Login button is clicked", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Student Demo"));

    const emailInput = screen.getByPlaceholderText("Enter your email") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;

    // After clicking Student Demo, the fields should be populated
    expect(emailInput.value).not.toBe("");
    expect(passwordInput.value).not.toBe("");
  });
});
