"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_role", data.role);

      alert("Login successful");

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Could not connect to the backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* LEFT SIDE */}
      <section className="login-hero">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          {/* BRAND */}
          <div className="brand">
            <div className="brand-icon">S</div>
            <span>ScholarAI</span>
          </div>

          {/* HERO TEXT */}
          <div className="hero-text">

            <h1>
              Find the right
              <br />
              scholarship for
              <br />
              <span>your future.</span>
            </h1>

            <p>
              Discover scholarships that match your education,
              profile and eligibility — all in one place.
            </p>

          </div>

          {/* FEATURES */}
          <div className="hero-features">

            <div className="feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h3>Personalized Matches</h3>
                <p>
                  Find scholarships based on your profile.
                </p>
              </div>

            </div>

            <div className="feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h3>Smart Eligibility</h3>
                <p>
                  Know which scholarships you qualify for.
                </p>
              </div>

            </div>

            <div className="feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h3>AI Assistance</h3>
                <p>
                  Get clear explanations and guidance.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* RIGHT SIDE */}
      <section className="login-form-section">

        <div className="login-container">

          {/* MOBILE BRAND */}
          <div className="mobile-brand">

            <div className="brand-icon">
              S
            </div>

            <span>ScholarAI</span>

          </div>

          {/* HEADING */}
          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to continue your scholarship journey.
            </p>

          </div>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert(
                      "Password reset will be available soon."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="input-wrapper">

                <span className="input-icon">
                  ●
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label="Show or hide password"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* SIGN UP */}
          <p className="signup-text">

            Don&apos;t have an account?{" "}

            <button
              type="button"
              onClick={() =>
                router.push("/signup")
              }
            >
              Create an account
            </button>

          </p>

          {/* FOOTER */}
          <p className="login-footer">

            By continuing, you agree to ScholarAI&apos;s
            terms and privacy policy.

          </p>

        </div>

      </section>

    </main>
  );
}