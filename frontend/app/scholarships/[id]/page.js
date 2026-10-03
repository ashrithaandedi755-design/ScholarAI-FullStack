"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./details.css";

const API_URL = "http://127.0.0.1:8000";

export default function ScholarshipDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [eligibility, setEligibility] =
    useState(null);
  const [checkingEligibility, setCheckingEligibility] =
    useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // Load scholarship details
  useEffect(() => {
    const loadScholarship = async () => {
      try {
        const response = await fetch(
          `${API_URL}/scholarship/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load scholarship"
          );
        }

        const data = await response.json();

        setScholarship(data);
      } catch (error) {
        console.error(
          "Scholarship details error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadScholarship();
    }
  }, [params.id, token]);

  // Check whether scholarship is already saved
  useEffect(() => {
    const checkSavedScholarship = async () => {
      try {
        const response = await fetch(
          `${API_URL}/saved/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load saved scholarships"
          );
        }

        const data = await response.json();

        const alreadySaved =
          data.saved_scholarships?.some(
            (item) =>
              item.scholarship_id ===
              Number(params.id)
          );

        setIsSaved(alreadySaved);
      } catch (error) {
        console.error(
          "Saved scholarship check error:",
          error
        );
      }
    };

    if (params.id && token) {
      checkSavedScholarship();
    }
  }, [params.id, token]);

  // Save scholarship
  const saveScholarship = async () => {
    if (isSaved) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/saved/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scholarship_id: scholarship.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to save scholarship"
        );
        return;
      }

      setIsSaved(true);

      alert("Scholarship saved successfully");
    } catch (error) {
      console.error(
        "Save scholarship error:",
        error
      );

      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Check eligibility
  const checkEligibility = async () => {
    setCheckingEligibility(true);

    try {
      const response = await fetch(
        `${API_URL}/eligibility/${scholarship.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to check eligibility"
        );
        return;
      }

      setEligibility(data);
    } catch (error) {
      console.error(
        "Eligibility check error:",
        error
      );

      alert("Something went wrong");
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <main className="details-page">
        <div className="details-container">
          <p>Loading scholarship...</p>
        </div>
      </main>
    );
  }

  // Scholarship not found
  if (!scholarship) {
    return (
      <main className="details-page">
        <div className="details-container">
          <h2>Scholarship not found</h2>

          <button
            onClick={() =>
              router.push("/scholarships")
            }
          >
            Back to Scholarships
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="details-page">
      <div className="details-container">

        {/* Back button */}

        <button
          className="back-button"
          onClick={() =>
            router.push("/scholarships")
          }
        >
          ← Back to Scholarships
        </button>

        <div className="details-card">

          {/* Header */}

          <div className="details-header">
            <h1>{scholarship.name}</h1>

            <p>
              Provider:{" "}
              <strong>
                {scholarship.provider}
              </strong>
            </p>
          </div>

          {/* Amount and deadline */}

          <div className="details-summary">

            <div className="summary-item">
              <span>
                Scholarship Amount
              </span>

              <strong>
                ₹
                {Number(
                  scholarship.amount
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="summary-item">
              <span>
                Application Deadline
              </span>

              <strong>
                {scholarship.deadline}
              </strong>
            </div>

          </div>

          {/* Description */}

          <section className="details-section">
            <h2>Description</h2>

            <p>
              {scholarship.description}
            </p>
          </section>

          {/* Eligibility description */}

          <section className="details-section">
            <h2>Eligibility</h2>

            <p>
              {scholarship.eligibility}
            </p>
          </section>

          {/* Eligibility requirements */}

          <section className="details-section">
            <h2>
              Eligibility Requirements
            </h2>

            <div className="requirements">

              {scholarship.min_income !==
                null &&
                scholarship.min_income !==
                  undefined && (
                  <p>
                    <strong>
                      Minimum Income:
                    </strong>{" "}
                    ₹
                    {Number(
                      scholarship.min_income
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                )}

              {scholarship.max_income !==
                null &&
                scholarship.max_income !==
                  undefined && (
                  <p>
                    <strong>
                      Maximum Income:
                    </strong>{" "}
                    ₹
                    {Number(
                      scholarship.max_income
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                )}

              {scholarship.required_state && (
                <p>
                  <strong>
                    Required State:
                  </strong>{" "}
                  {scholarship.required_state}
                </p>
              )}

              {scholarship.required_category && (
                <p>
                  <strong>
                    Required Category:
                  </strong>{" "}
                  {scholarship.required_category}
                </p>
              )}

              {scholarship.required_education && (
                <p>
                  <strong>
                    Required Education:
                  </strong>{" "}
                  {scholarship.required_education}
                </p>
              )}

              {!scholarship.min_income &&
                !scholarship.max_income &&
                !scholarship.required_state &&
                !scholarship.required_category &&
                !scholarship.required_education && (
                  <p>
                    No specific requirements
                    provided.
                  </p>
                )}

            </div>
          </section>

          {/* Application */}

          <section className="details-section">
            <h2>Application</h2>

            <p>
              Apply using the official
              application link provided for
              this scholarship.
            </p>

            <div className="application-buttons">

              {/* Save */}

              <button
                type="button"
                className="save-button"
                onClick={saveScholarship}
                disabled={
                  isSaved || saving
                }
              >
                {saving
                  ? "Saving..."
                  : isSaved
                  ? "✓ Saved"
                  : "Save Scholarship"}
              </button>

              {/* Check Eligibility */}

              <button
                type="button"
                className="eligibility-button"
                onClick={checkEligibility}
                disabled={
                  checkingEligibility
                }
              >
                {checkingEligibility
                  ? "Checking..."
                  : "Check Eligibility"}
              </button>

              {/* Apply */}

              <a
                href={
                  scholarship.application_link
                }
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                Apply for Scholarship
              </a>

            </div>
          </section>

          {/* Eligibility Result */}

          {eligibility && (
            <section className="eligibility-result">

              <h2>
                Eligibility Result
              </h2>

              <h3
                className={
                  eligibility.eligible
                    ? "eligible"
                    : "not-eligible"
                }
              >
                {eligibility.eligible
                  ? "✓ You are eligible"
                  : "✗ You are not eligible"}
              </h3>

              {eligibility.reasons &&
                eligibility.reasons.length >
                  0 && (
                  <div className="eligibility-reasons">

                    <strong>
                      Reasons:
                    </strong>

                    <ul>
                      {eligibility.reasons.map(
                        (
                          reason,
                          index
                        ) => (
                          <li key={index}>
                            {reason}
                          </li>
                        )
                      )}
                    </ul>

                  </div>
                )}

              {eligibility.ai_explanation && (
                <div className="ai-explanation">

                  <strong>
                    AI Explanation
                  </strong>

                  <p>
                    {
                      eligibility.ai_explanation
                    }
                  </p>

                </div>
              )}

            </section>
          )}

        </div>
      </div>
    </main>
  );
}