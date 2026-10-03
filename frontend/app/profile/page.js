"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiBookOpen,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiSave,
  FiArrowLeft,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    education: "",
    state: "",
    category: "",
    income: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing profile
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          // Profile does not exist yet
          setHasProfile(false);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail || "Unable to load profile"
          );
        }

        const data = await response.json();

        setFormData({
          education: data.education || "",
          state: data.state || "",
          category: data.category || "",
          income:
            data.income !== undefined && data.income !== null
              ? String(data.income)
              : "",
        });

        setHasProfile(true);
      } catch (err) {
        console.error("Profile loading error:", err);
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // Save or update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!formData.education.trim()) {
      setError("Please enter your education.");
      return;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state.");
      return;
    }

    if (!formData.category.trim()) {
      setError("Please enter your category.");
      return;
    }

    if (formData.income === "") {
      setError("Please enter your annual family income.");
      return;
    }

    const incomeValue = Number(formData.income);

    if (Number.isNaN(incomeValue) || incomeValue < 0) {
      setError("Income must be a valid number greater than or equal to 0.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);

    try {
      const method = hasProfile ? "PUT" : "POST";

      const response = await fetch(`${API_URL}/profile/`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          education: formData.education.trim(),
          state: formData.state.trim(),
          category: formData.category.trim(),
          income: incomeValue,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save profile. Please try again."
        );
      }

      setHasProfile(true);

      setMessage(
        hasProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
    } catch (err) {
      console.error("Profile save error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading your profile...</p>

        <style jsx>{`
          .profile-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f5f7fb;
            color: #475569;
          }

          .profile-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .profile-loading p {
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <div className="logo-icon">
            <FiBookOpen />
          </div>

          <div>
            <h1>ScholarAI</h1>
            <p>Student Profile</p>
          </div>
        </div>

        <button
          className="back-button"
          onClick={() => router.push("/dashboard")}
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>
      </header>

      {/* Main content */}
      <main className="profile-container">
        <div className="profile-card">
          {/* Card heading */}
          <div className="card-heading">
            <div className="heading-icon">
              <FiUser />
            </div>

            <div>
              <h2>
                {hasProfile ? "Edit Your Profile" : "Create Your Profile"}
              </h2>

              <p>
                {hasProfile
                  ? "Update your information to improve scholarship recommendations."
                  : "Enter your details to find scholarships that match your eligibility."}
              </p>
            </div>
          </div>

          {/* Success message */}
          {message && (
            <div className="success-message">
              ✓ {message}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message">
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Education */}
            <div className="form-group">
              <label htmlFor="education">
                <FiBookOpen />
                Education
              </label>

              <input
                id="education"
                name="education"
                type="text"
                placeholder="Example: B.Tech Computer Science"
                value={formData.education}
                onChange={handleChange}
              />

              <small>
                Enter your current course or highest level of education.
              </small>
            </div>

            {/* State */}
            <div className="form-group">
              <label htmlFor="state">
                <FiMapPin />
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="Example: Telangana"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                <FiUsers />
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select your category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            {/* Income */}
            <div className="form-group">
              <label htmlFor="income">
                <FiDollarSign />
                Annual Family Income
              </label>

              <input
                id="income"
                name="income"
                type="number"
                min="0"
                placeholder="Example: 300000"
                value={formData.income}
                onChange={handleChange}
              />

              <small>
                Enter your annual family income in Indian Rupees.
              </small>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                <FiSave />

                {saving
                  ? "Saving..."
                  : hasProfile
                  ? "Update Profile"
                  : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Information box */}
        <div className="info-box">
          <div className="info-icon">💡</div>

          <div>
            <h3>Why do we need this information?</h3>

            <p>
              ScholarAI uses your education, state, category, and family
              income to identify scholarships that may match your eligibility.
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .profile-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #1e293b;
        }

        /* Header */

        .profile-header {
          height: 76px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 21px;
          font-weight: 700;
        }

        .header-left p {
          margin: 2px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .back-button {
          border: 1px solid #dbe1ea;
          background: white;
          color: #334155;
          padding: 10px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }

        .back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Main */

        .profile-container {
          max-width: 850px;
          margin: 0 auto;
          padding: 45px 20px 60px;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
          padding: 35px;
        }

        .card-heading {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 25px;
          border-bottom: 1px solid #edf0f4;
          margin-bottom: 25px;
        }

        .heading-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .card-heading h2 {
          margin: 0;
          font-size: 25px;
          color: #0f172a;
        }

        .card-heading p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Messages */

        .success-message {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        /* Form */

        .form-group {
          margin-bottom: 22px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 8px;
        }

        .form-group label svg {
          color: #2563eb;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #1e293b;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-group input::placeholder {
          color: #94a3b8;
        }

        .form-group small {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 12px;
        }

        /* Buttons */

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 25px;
          border-top: 1px solid #edf0f4;
        }

        .cancel-button,
        .save-button {
          height: 44px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
        }

        .cancel-button {
          background: white;
          border: 1px solid #d1d5db;
          color: #475569;
        }

        .cancel-button:hover {
          background: #f8fafc;
        }

        .save-button {
          background: #2563eb;
          border: 1px solid #2563eb;
          color: white;
        }

        .save-button:hover {
          background: #1d4ed8;
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Info */

        .info-box {
          margin-top: 20px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          gap: 13px;
        }

        .info-icon {
          font-size: 22px;
        }

        .info-box h3 {
          margin: 0 0 5px;
          font-size: 14px;
          color: #1e3a8a;
        }

        .info-box p {
          margin: 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.5;
        }

        /* Mobile */

        @media (max-width: 650px) {
          .profile-header {
            padding: 0 18px;
          }

          .back-button {
            padding: 9px 11px;
          }

          .back-button {
            font-size: 0;
          }

          .back-button svg {
            font-size: 18px;
          }

          .profile-container {
            padding: 25px 14px 40px;
          }

          .profile-card {
            padding: 22px;
          }

          .card-heading h2 {
            font-size: 21px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .save-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}