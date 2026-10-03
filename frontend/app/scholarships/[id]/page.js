"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import "./details.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ScholarshipDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [scholarship, setScholarship] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [isSaved, setIsSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [eligibility, setEligibility] =
    useState(null);

  const [checkingEligibility, setCheckingEligibility] =
    useState(false);

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }

    return null;
  };

  // ============================================================
  // LOAD SCHOLARSHIP DETAILS
  // ============================================================

  const loadScholarship = useCallback(
    async () => {
      if (!params.id) {
        return;
      }

      setLoading(true);

      try {
        const token = getToken();

        const response = await fetch(
          `${API_URL}/scholarship/${params.id}`,
          {
            method: "GET",
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load scholarship: ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "Scholarship details:",
          data
        );

        setScholarship(data);
      } catch (error) {
        console.error(
          "Scholarship details error:",
          error
        );

        setScholarship(null);
      } finally {
        setLoading(false);
      }
    },
    [params.id]
  );

  // ============================================================
  // LOAD SAVED STATUS
  // ============================================================

  const checkSavedScholarship =
    useCallback(async () => {
      if (!params.id) {
        return;
      }

      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/saved/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load saved scholarships: ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "Saved scholarships:",
          data
        );

        /*
          Backend normally returns:

          {
            "count": ...,
            "saved_scholarships": [...]
          }

          This also supports a direct array response.
        */

        const savedList =
          Array.isArray(data)
            ? data
            : data.saved_scholarships || [];

        const scholarshipId =
          Number(params.id);

        const alreadySaved =
          savedList.some(
            (item) =>
              Number(
                item.scholarship_id
              ) === scholarshipId
          );

        setIsSaved(alreadySaved);
      } catch (error) {
        console.error(
          "Saved scholarship check error:",
          error
        );

        setIsSaved(false);
      }
    }, [params.id]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const loadPageData = async () => {
      await loadScholarship();
      await checkSavedScholarship();
    };

    loadPageData();
  }, [
    loadScholarship,
    checkSavedScholarship,
  ]);

  // ============================================================
  // SAVE SCHOLARSHIP
  // ============================================================

  const saveScholarship = async () => {
    if (!scholarship) {
      return;
    }

    if (isSaved) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Please login to save scholarships."
      );

      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/saved/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            scholarship_id:
              scholarship.id,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.detail ||
            "Failed to save scholarship"
        );

        return;
      }

      setIsSaved(true);

      alert(
        "Scholarship saved successfully"
      );
    } catch (error) {
      console.error(
        "Save scholarship error:",
        error
      );

      alert(
        "Something went wrong while saving the scholarship."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CHECK ELIGIBILITY
  // ============================================================

  const checkEligibility = async () => {
    if (!scholarship) {
      return;
    }

    const token = getToken();

    if (!token) {
      alert(
        "Please login to check eligibility."
      );

      return;
    }

    setCheckingEligibility(true);

    setEligibility(null);

    try {
      const response = await fetch(
        `${API_URL}/eligibility/${scholarship.id}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      console.log(
        "Eligibility response:",
        data
      );

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

      alert(
        "Something went wrong while checking eligibility."
      );
    } finally {
      setCheckingEligibility(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="details-page">
        <div className="details-container">
          <p>
            Loading scholarship...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // SCHOLARSHIP NOT FOUND
  // ============================================================

  if (!scholarship) {
    return (
      <main className="details-page">
        <div className="details-container">

          <h2>
            Scholarship not found
          </h2>

          <button
            className="back-button"
            onClick={() =>
              router.push(
                "/scholarships"
              )
            }
          >
            Back to Scholarships
          </button>

        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="details-page">

      <div className="details-container">

        {/* Back Button */}

        <button
          className="back-button"
          onClick={() =>
            router.push(
              "/scholarships"
            )
          }
        >
          ← Back to Scholarships
        </button>

        {/* Details Card */}

        <div className="details-card">

          {/* Header */}

          <div className="details-header">

            <h1>
              {scholarship.name}
            </h1>

            <p>
              Provider:{" "}
              <strong>
                {scholarship.provider}
              </strong>
            </p>

          </div>

          {/* Amount and Deadline */}

          <div className="details-summary">

            <div className="summary-item">

              <span>
                Scholarship Amount
              </span>

              <strong>
                ₹
                {Number(
                  scholarship.amount
                ).toLocaleString(
                  "en-IN"
                )}
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

            <h2>
              Description
            </h2>

            <p>
              {scholarship.description}
            </p>

          </section>

          {/* Eligibility */}

          <section className="details-section">

            <h2>
              Eligibility
            </h2>

            <p>
              {scholarship.eligibility}
            </p>

          </section>

          {/* Eligibility Requirements */}

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

          {/* Application Section */}

          <section className="details-section">

            <h2>
              Application
            </h2>

            <p>
              You can save this scholarship,
              check your eligibility, or open
              the application link.
            </p>

            <div className="application-buttons">

              {/* SAVE */}

              <button
                type="button"
                className="save-button"
                onClick={
                  saveScholarship
                }
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

              {/* CHECK ELIGIBILITY */}

              <button
                type="button"
                className="eligibility-button"
                onClick={
                  checkEligibility
                }
                disabled={
                  checkingEligibility
                }
              >
                {checkingEligibility
                  ? "Checking..."
                  : "Check Eligibility"}
              </button>

              {/* APPLY */}

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

          {/* ELIGIBILITY RESULT */}

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

              {/* Reasons */}

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

                          <li
                            key={index}
                          >
                            {reason}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                )}

              {/* AI Explanation */}

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