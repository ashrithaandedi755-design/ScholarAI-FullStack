"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [scholarships, setScholarships] = useState([]);
  const [loadingScholarships, setLoadingScholarships] =
    useState(false);

  const [stats, setStats] = useState({
    total_students: 0,
    total_scholarships: 0,
    total_applications: 0,
    total_saved_scholarships: 0,
  });

  const [showForm, setShowForm] = useState(false);
  const [savingScholarship, setSavingScholarship] =
    useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    provider: "",
    description: "",
    amount: "",
    deadline: "",
    eligibility: "",
    application_link: "",
    min_income: "",
    max_income: "",
    required_state: "",
    required_category: "",
    required_education: "",
  });

  // =========================
  // Admin Authentication
  // =========================

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (data.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error(
          "Admin authentication error:",
          error
        );

        router.push("/login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdmin();
  }, [router]);

  // =========================
  // Load Scholarships
  // =========================

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const fetchScholarships = async () => {
      const token = localStorage.getItem("token");

      setLoadingScholarships(true);

      try {
        const response = await fetch(
          `${API_URL}/scholarship/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load scholarships"
          );
        }

        const data = await response.json();

        setScholarships(data.results || []);
      } catch (error) {
        console.error(
          "Scholarship loading error:",
          error
        );
      } finally {
        setLoadingScholarships(false);
      }
    };

    fetchScholarships();
  }, [authorized]);

  // =========================
  // Load Admin Statistics
  // =========================

  useEffect(() => {
    if (!authorized) {
      return;
    }

    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          `${API_URL}/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load admin statistics"
          );
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error(
          "Admin statistics error:",
          error
        );
      }
    };

    fetchStats();
  }, [authorized]);

  // =========================
  // Reload Scholarships
  // =========================

  const loadScholarships = async () => {
    const token = localStorage.getItem("token");

    setLoadingScholarships(true);

    try {
      const response = await fetch(
        `${API_URL}/scholarship/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load scholarships"
        );
      }

      const data = await response.json();

      setScholarships(data.results || []);
    } catch (error) {
      console.error(
        "Scholarship loading error:",
        error
      );
    } finally {
      setLoadingScholarships(false);
    }
  };

  // =========================
  // Reload Statistics
  // =========================

  const loadStats = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load admin statistics"
        );
      }

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error(
        "Admin statistics error:",
        error
      );
    }
  };

  // =========================
  // Form Change
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // =========================
  // Add Scholarship
  // =========================

  const handleAddScholarship = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    setSavingScholarship(true);

    try {
      const scholarshipData = {
        name: form.name,
        provider: form.provider,
        description: form.description,
        amount: Number(form.amount),
        deadline: form.deadline,
        eligibility: form.eligibility,
        application_link: form.application_link,

        min_income:
          form.min_income === ""
            ? null
            : Number(form.min_income),

        max_income:
          form.max_income === ""
            ? null
            : Number(form.max_income),

        required_state:
          form.required_state === ""
            ? null
            : form.required_state,

        required_category:
          form.required_category === ""
            ? null
            : form.required_category,

        required_education:
          form.required_education === ""
            ? null
            : form.required_education,
      };

      const response = await fetch(
        `${API_URL}/scholarship/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(scholarshipData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to add scholarship"
        );
        return;
      }

      alert("Scholarship added successfully");

      resetForm();

      await loadScholarships();
      await loadStats();
    } catch (error) {
      console.error(
        "Add scholarship error:",
        error
      );

      alert("Something went wrong");
    } finally {
      setSavingScholarship(false);
    }
  };

  // =========================
  // Edit Scholarship
  // =========================

  const handleEdit = (scholarship) => {
    setEditingId(scholarship.id);

    setForm({
      name: scholarship.name || "",
      provider: scholarship.provider || "",
      description:
        scholarship.description || "",
      amount:
        scholarship.amount ?? "",
      deadline:
        scholarship.deadline || "",
      eligibility:
        scholarship.eligibility || "",
      application_link:
        scholarship.application_link || "",
      min_income:
        scholarship.min_income ?? "",
      max_income:
        scholarship.max_income ?? "",
      required_state:
        scholarship.required_state || "",
      required_category:
        scholarship.required_category || "",
      required_education:
        scholarship.required_education || "",
    });

    setShowForm(true);
  };

  // =========================
  // Update Scholarship
  // =========================

  const handleUpdateScholarship = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    setSavingScholarship(true);

    try {
      const scholarshipData = {
        name: form.name,
        provider: form.provider,
        description: form.description,
        amount: Number(form.amount),
        deadline: form.deadline,
        eligibility: form.eligibility,
        application_link: form.application_link,

        min_income:
          form.min_income === ""
            ? null
            : Number(form.min_income),

        max_income:
          form.max_income === ""
            ? null
            : Number(form.max_income),

        required_state:
          form.required_state === ""
            ? null
            : form.required_state,

        required_category:
          form.required_category === ""
            ? null
            : form.required_category,

        required_education:
          form.required_education === ""
            ? null
            : form.required_education,
      };

      const response = await fetch(
        `${API_URL}/scholarship/${editingId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(scholarshipData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to update scholarship"
        );
        return;
      }

      alert(
        "Scholarship updated successfully"
      );

      resetForm();

      await loadScholarships();
      await loadStats();
    } catch (error) {
      console.error(
        "Update scholarship error:",
        error
      );

      alert("Something went wrong");
    } finally {
      setSavingScholarship(false);
    }
  };

  // =========================
  // Reset Form
  // =========================

  const resetForm = () => {
    setForm({
      name: "",
      provider: "",
      description: "",
      amount: "",
      deadline: "",
      eligibility: "",
      application_link: "",
      min_income: "",
      max_income: "",
      required_state: "",
      required_category: "",
      required_education: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =========================
  // Delete Scholarship
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this scholarship?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/scholarship/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to delete scholarship"
        );
        return;
      }

      alert(
        "Scholarship deleted successfully"
      );

      await loadScholarships();
      await loadStats();
    } catch (error) {
      console.error(
        "Delete scholarship error:",
        error
      );

      alert("Something went wrong");
    }
  };

  // =========================
  // Loading
  // =========================

  if (checkingAuth) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <p>Checking admin access...</p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  // =========================
  // Admin Dashboard
  // =========================

  return (
    <main className="admin-page">
      <div className="admin-container">

        {/* Header */}

        <div className="admin-header">

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Manage scholarships and monitor
              the ScholarAI system.
            </p>
          </div>

          <button
            className="back-button"
            onClick={() =>
              router.push("/dashboard")
            }
          >
            Back to Dashboard
          </button>

        </div>

        {/* Summary Cards */}

        <div className="admin-summary">

          <div className="admin-card">
            <h3>Total Scholarships</h3>
            <p>
              {stats.total_scholarships}
            </p>
          </div>

          <div className="admin-card">
            <h3>Students</h3>
            <p>
              {stats.total_students}
            </p>
          </div>

          <div className="admin-card">
            <h3>Applications</h3>
            <p>
              {stats.total_applications}
            </p>
          </div>

          <div className="admin-card">
            <h3>Saved Scholarships</h3>
            <p>
              {stats.total_saved_scholarships}
            </p>
          </div>

        </div>

        {/* Scholarship Management */}

        <section className="admin-section">

          <div className="section-header">

            <div>
              <h2>
                Scholarship Management
              </h2>

              <p>
                Add, edit and delete
                scholarships.
              </p>
            </div>

            <button
              className="add-button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              {showForm
                ? "Cancel"
                : "+ Add Scholarship"}
            </button>

          </div>

          {/* Scholarship Form */}

          {showForm && (
            <form
              className="scholarship-form"
              onSubmit={
                editingId
                  ? handleUpdateScholarship
                  : handleAddScholarship
              }
            >

              <h3>
                {editingId
                  ? "Edit Scholarship"
                  : "Add New Scholarship"}
              </h3>

              <div className="form-group">

                <label>
                  Scholarship Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Scholarship name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Provider
                </label>

                <input
                  type="text"
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  placeholder="Provider name"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Scholarship description"
                  rows="4"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Scholarship Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Amount"
                  min="0"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Application Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Eligibility Description
                </label>

                <textarea
                  name="eligibility"
                  value={form.eligibility}
                  onChange={handleChange}
                  placeholder="Eligibility requirements"
                  rows="4"
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Application Link
                </label>

                <input
                  type="url"
                  name="application_link"
                  value={form.application_link}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  required
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Minimum Income
                  </label>

                  <input
                    type="number"
                    name="min_income"
                    value={form.min_income}
                    onChange={handleChange}
                    placeholder="Optional"
                    min="0"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Maximum Income
                  </label>

                  <input
                    type="number"
                    name="max_income"
                    value={form.max_income}
                    onChange={handleChange}
                    placeholder="Optional"
                    min="0"
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Required State
                </label>

                <input
                  type="text"
                  name="required_state"
                  value={form.required_state}
                  onChange={handleChange}
                  placeholder="Optional"
                />

              </div>

              <div className="form-group">

                <label>
                  Required Category
                </label>

                <input
                  type="text"
                  name="required_category"
                  value={form.required_category}
                  onChange={handleChange}
                  placeholder="Optional"
                />

              </div>

              <div className="form-group">

                <label>
                  Required Education
                </label>

                <input
                  type="text"
                  name="required_education"
                  value={form.required_education}
                  onChange={handleChange}
                  placeholder="Optional"
                />

              </div>

              <button
                type="submit"
                className="save-scholarship-button"
                disabled={savingScholarship}
              >
                {savingScholarship
                  ? "Saving..."
                  : editingId
                  ? "Update Scholarship"
                  : "Save Scholarship"}
              </button>

            </form>
          )}

          {/* Loading */}

          {loadingScholarships && (
            <div className="empty-state">
              <h3>
                Loading scholarships...
              </h3>
            </div>
          )}

          {/* Empty */}

          {!loadingScholarships &&
            scholarships.length === 0 && (
              <div className="empty-state">

                <h3>
                  No scholarships found
                </h3>

                <p>
                  Add a scholarship to
                  display it here.
                </p>

              </div>
            )}

          {/* Scholarship List */}

          {!loadingScholarships &&
            scholarships.length > 0 && (
              <div className="admin-scholarship-list">

                {scholarships.map(
                  (scholarship) => (
                    <div
                      className="admin-scholarship-card"
                      key={scholarship.id}
                    >

                      <div>

                        <h3>
                          {scholarship.name}
                        </h3>

                        <p>
                          Provider:{" "}
                          {scholarship.provider}
                        </p>

                        <p>
                          Amount: ₹
                          {Number(
                            scholarship.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p>
                          Deadline:{" "}
                          {scholarship.deadline}
                        </p>

                      </div>

                      <div className="admin-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(
                              scholarship
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              scholarship.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

        </section>

      </div>
    </main>
  );
}