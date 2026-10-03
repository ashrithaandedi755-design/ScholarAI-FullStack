"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const loadDashboard = async () => {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [
          profileResponse,
          recommendationResponse,
          savedResponse,
          applicationResponse,
          documentResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/profile/`, {
            headers,
          }),

          fetch(`${API_URL}/recommendation/`, {
            headers,
          }),

          fetch(`${API_URL}/saved/`, {
            headers,
          }),

          fetch(`${API_URL}/application/`, {
            headers,
          }),

          fetch(`${API_URL}/document/`, {
            headers,
          }),
        ]);

        /* =================================================
           PROFILE
        ================================================= */

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        } else {
          console.log(
            "Profile request failed:",
            profileResponse.status
          );
        }

        /* =================================================
           RECOMMENDATIONS
        ================================================= */

        if (recommendationResponse.ok) {
          const recommendationData =
            await recommendationResponse.json();

          if (Array.isArray(recommendationData)) {
            setScholarships(recommendationData);
          } else {
            setScholarships(
              recommendationData.recommendations ||
                recommendationData.results ||
                []
            );
          }
        } else {
          console.log(
            "Recommendation request failed:",
            recommendationResponse.status
          );

          setScholarships([]);
        }

        /* =================================================
           SAVED SCHOLARSHIPS
        ================================================= */

        if (savedResponse.ok) {
          const savedData = await savedResponse.json();

          if (Array.isArray(savedData)) {
            setSavedScholarships(savedData);
          } else {
            setSavedScholarships(
              savedData.saved_scholarships ||
                savedData.saved ||
                savedData.results ||
                []
            );
          }
        } else {
          console.log(
            "Saved scholarships request failed:",
            savedResponse.status
          );

          setSavedScholarships([]);
        }

        /* =================================================
           APPLICATIONS
        ================================================= */

        if (applicationResponse.ok) {
          const applicationData =
            await applicationResponse.json();

          if (Array.isArray(applicationData)) {
            setApplications(applicationData);
          } else {
            setApplications(
              applicationData.applications ||
                applicationData.results ||
                []
            );
          }
        } else {
          console.log(
            "Applications request failed:",
            applicationResponse.status
          );

          setApplications([]);
        }

        /* =================================================
           DOCUMENTS
        ================================================= */

        if (documentResponse.ok) {
          const documentData =
            await documentResponse.json();

          if (Array.isArray(documentData)) {
            setDocuments(documentData);
          } else {
            setDocuments(
              documentData.documents ||
                documentData.results ||
                []
            );
          }
        } else {
          console.log(
            "Documents request failed:",
            documentResponse.status
          );

          setDocuments([]);
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      }
    };

    loadDashboard();
  }, [router]);

  /* =====================================================
     HELPER FUNCTIONS
  ===================================================== */

  const getScholarshipName = (item) => {
    return (
      item?.scholarship?.name ||
      item?.scholarship_name ||
      item?.name ||
      "Scholarship"
    );
  };

  const getScholarshipProvider = (item) => {
    return (
      item?.scholarship?.provider ||
      item?.provider ||
      "Provider"
    );
  };

  const getScholarshipAmount = (item) => {
    const amount =
      item?.scholarship?.amount ??
      item?.amount ??
      0;

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  /*
    Get the scholarship ID from different possible
    backend response formats.
  */
  

  /*
    Get saved record ID.

    IMPORTANT:
    We must delete the SAVED RECORD ID,
    not the scholarship ID.
  */
  const getSavedId = (item) => {
    return (
      item?.id ??
      item?.saved_id ??
      item?.saved_scholarship_id ??
      null
    );
  };

  const getApplicationId = (item) => {
    return (
      item?.id ??
      item?.application_id ??
      null
    );
  };

  const getDocumentId = (item) => {
    return (
      item?.id ??
      item?.document_id ??
      null
    );
  };

  /* =====================================================
     SAFE UNIQUE KEY
  ===================================================== */

  const getSafeKey = (
    item,
    index,
    prefix
  ) => {
    let identifier = "item";

    if (
      item?.id !== undefined &&
      item?.id !== null
    ) {
      identifier = `id-${item.id}`;
    } else if (
      item?.document_id !== undefined &&
      item?.document_id !== null
    ) {
      identifier = `document-${item.document_id}`;
    } else if (
      item?.application_id !== undefined &&
      item?.application_id !== null
    ) {
      identifier = `application-${item.application_id}`;
    } else if (
      item?.saved_id !== undefined &&
      item?.saved_id !== null
    ) {
      identifier = `saved-${item.saved_id}`;
    } else if (
      item?.scholarship_id !== undefined &&
      item?.scholarship_id !== null
    ) {
      identifier = `scholarship-${item.scholarship_id}`;
    } else if (item?.name) {
      identifier = `name-${item.name}`;
    } else if (item?.document_name) {
      identifier = `document-name-${item.document_name}`;
    }

    return `${prefix}-${identifier}-${index}`;
  };

  /* =====================================================
     SAVE SCHOLARSHIP
  ===================================================== */

  const saveScholarship = async (
    scholarshipId
  ) => {
    const token =
      localStorage.getItem("token");

    if (!scholarshipId) {
      return;
    }

    setActionLoading(
      `save-${scholarshipId}`
    );

    try {
      const response = await fetch(
        `${API_URL}/saved/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scholarship_id: scholarshipId,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (response.ok) {
        /*
          Reload saved scholarships
          after saving.
        */
        await loadSavedScholarships();
      } else {
        alert(
          data.detail ||
            "Unable to save scholarship"
        );
      }
    } catch (error) {
      console.error(
        "Save scholarship error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================================================
     LOAD SAVED SCHOLARSHIPS
  ===================================================== */

  const loadSavedScholarships =
    async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/saved/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Unable to load saved scholarships:",
            response.status
          );
          return;
        }

        const data =
          await response.json();

        if (Array.isArray(data)) {
          setSavedScholarships(data);
        } else {
          setSavedScholarships(
            data.saved_scholarships ||
              data.saved ||
              data.results ||
              []
          );
        }
      } catch (error) {
        console.error(
          "Load saved scholarships error:",
          error
        );
      }
    };

  /* =====================================================
     UNSAVE SCHOLARSHIP
  ===================================================== */

  const unsaveScholarship = async (
    savedItem
  ) => {
    const token =
      localStorage.getItem("token");

    const savedId =
      getSavedId(savedItem);

    if (!savedId) {
      alert(
        "Unable to find the saved scholarship ID."
      );
      return;
    }

    setActionLoading(
      `unsave-${savedId}`
    );

    try {
      const response = await fetch(
        `${API_URL}/saved/${savedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (response.ok) {
        /*
          Remove the scholarship immediately
          from the screen.
        */
        setSavedScholarships(
          (previous) =>
            previous.filter(
              (item) =>
                getSavedId(item) !==
                savedId
            )
        );
      } else {
        alert(
          data.detail ||
            "Unable to unsave scholarship."
        );
      }
    } catch (error) {
      console.error(
        "Unsave scholarship error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================================================
     APPLICATION STATUS
  ===================================================== */

  const updateApplicationStatus =
    async (
      application,
      newStatus
    ) => {
      const token =
        localStorage.getItem("token");

      const applicationId =
        getApplicationId(application);

      if (!applicationId) {
        alert(
          "Unable to find the application ID."
        );
        return;
      }

      setActionLoading(
        `application-${applicationId}`
      );

      try {
        const response = await fetch(
          `${API_URL}/application/${applicationId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

        const data =
          await response.json().catch(
            () => ({})
          );

        if (!response.ok) {
          alert(
            data.detail ||
              "Unable to update application status."
          );
          return;
        }

        /*
          Update only the changed application
          instead of reloading the entire dashboard.
        */
        setApplications(
          (previous) =>
            previous.map(
              (item) =>
                getApplicationId(item) ===
                applicationId
                  ? {
                      ...item,
                      status:
                        newStatus,
                    }
                  : item
            )
        );
      } catch (error) {
        console.error(
          "Update application error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );
      } finally {
        setActionLoading(null);
      }
    };

  /* =====================================================
     DELETE APPLICATION
  ===================================================== */

  const deleteApplication = async (
    application
  ) => {
    const token =
      localStorage.getItem("token");

    const applicationId =
      getApplicationId(application);

    if (!applicationId) {
      alert(
        "Unable to find the application ID."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this application from your tracker?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      `delete-application-${applicationId}`
    );

    try {
      const response = await fetch(
        `${API_URL}/application/${applicationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        alert(
          data.detail ||
            "Unable to delete application."
        );
        return;
      }

      setApplications(
        (previous) =>
          previous.filter(
            (item) =>
              getApplicationId(item) !==
              applicationId
          )
      );
    } catch (error) {
      console.error(
        "Delete application error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================================================
     DOCUMENT READY / NOT READY
  ===================================================== */

  const updateDocumentStatus =
    async (
      document,
      newReadyStatus
    ) => {
      const token =
        localStorage.getItem("token");

      const documentId =
        getDocumentId(document);

      if (!documentId) {
        alert(
          "Unable to find the document ID."
        );
        return;
      }

      setActionLoading(
        `document-${documentId}`
      );

      try {
        const response = await fetch(
          `${API_URL}/document/${documentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              is_ready: newReadyStatus,
            }),
          }
        );

        const data =
          await response.json().catch(
            () => ({})
          );

        if (!response.ok) {
          alert(
            data.detail ||
              "Unable to update document."
          );
          return;
        }

        setDocuments(
          (previous) =>
            previous.map(
              (item) =>
                getDocumentId(item) ===
                documentId
                  ? {
                      ...item,
                      is_ready:
                        newReadyStatus,
                    }
                  : item
            )
        );
      } catch (error) {
        console.error(
          "Update document error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );
      } finally {
        setActionLoading(null);
      }
    };

  /* =====================================================
     DELETE DOCUMENT
  ===================================================== */

  const deleteDocument = async (
    document
  ) => {
    const token =
      localStorage.getItem("token");

    const documentId =
      getDocumentId(document);

    if (!documentId) {
      alert(
        "Unable to find the document ID."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this document?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(
      `delete-document-${documentId}`
    );

    try {
      const response = await fetch(
        `${API_URL}/document/${documentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        alert(
          data.detail ||
            "Unable to delete document."
        );
        return;
      }

      setDocuments(
        (previous) =>
          previous.filter(
            (item) =>
              getDocumentId(item) !==
              documentId
          )
      );
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================================================
     ASK AI
  ===================================================== */

  const askAI = async () => {
    if (!question.trim()) {
      return;
    }

    const token =
      localStorage.getItem("token");

    setLoadingAI(true);
    setAiResponse("");

    try {
      const response = await fetch(
        `${API_URL}/chat/ask`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: question,
          }),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        setAiResponse(
          data.reply || ""
        );
      } else {
        setAiResponse(
          data.detail ||
            "Unable to get an AI response."
        );
      }
    } catch (error) {
      console.error(
        "AI error:",
        error
      );

      setAiResponse(
        "Unable to connect to the AI assistant."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");

    router.push("/login");
  };

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";

      case "Under Review":
        return "status-review";

      case "Selected":
        return "status-selected";

      case "Rejected":
        return "status-rejected";

      default:
        return "status-not-applied";
    }
  };

  /* =====================================================
     COUNTS
  ===================================================== */

  const recommendedCount =
    scholarships.length;

  const savedCount =
    savedScholarships.length;

  const applicationCount =
    applications.length;

  const documentCount =
    documents.length;

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="dashboard-navbar">

        <div
          className="navbar-brand"
          onClick={() =>
            router.push("/dashboard")
          }
        >
          <div className="navbar-logo">
            🎓
          </div>

          ScholarAI
        </div>

        <div className="navbar-links">

          <button
            className="nav-link active"
            onClick={() =>
              router.push("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="nav-link"
            onClick={() =>
              router.push("/scholarships")
            }
          >
            Scholarships
          </button>

          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="dashboard-container">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="welcome-section">

          <h1>
            Welcome back,{" "}
            {profile?.name ||
              "Student"} 👋
          </h1>

          <p>
            Find scholarships that match
            your profile.
          </p>

        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">
              🎓
            </div>

            <div>
              <p>Recommended</p>

              <h2>
                {recommendedCount}
              </h2>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              ⭐
            </div>

            <div>
              <p>Saved</p>

              <h2>
                {savedCount}
              </h2>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              📋
            </div>

            <div>
              <p>Applications</p>

              <h2>
                {applicationCount}
              </h2>
            </div>

          </div>

          <div className="summary-card">

            <div className="summary-icon">
              📄
            </div>

            <div>
              <p>Documents</p>

              <h2>
                {documentCount}
              </h2>
            </div>

          </div>

        </section>

        {/* =================================================
            STUDENT PROFILE
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <h2>
                Student Profile
              </h2>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                router.push("/profile")
              }
            >
              Edit Profile
            </button>

          </div>

          {profile ? (

            <div className="profile-card">

              <div className="profile-details">

                <div className="profile-row">
                  <span>
                    Education
                  </span>

                  <strong>
                    {profile.education}
                  </strong>
                </div>

                <div className="profile-row">
                  <span>
                    State
                  </span>

                  <strong>
                    {profile.state}
                  </strong>
                </div>

                <div className="profile-row">
                  <span>
                    Category
                  </span>

                  <strong>
                    {profile.category}
                  </strong>
                </div>

                <div className="profile-row">
                  <span>
                    Income
                  </span>

                  <strong>
                    ₹
                    {Number(
                      profile.income
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

              </div>

            </div>

          ) : (

            <div className="empty-profile">

              <p>
                Profile information
                not available.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  router.push("/profile")
                }
              >
                Create Profile
              </button>

            </div>

          )}

        </section>

        {/* =================================================
            RECOMMENDED SCHOLARSHIPS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <h2>
                Recommended Scholarships
              </h2>
            </div>

            <button
              className="view-all-button"
              onClick={() =>
                router.push(
                  "/scholarships"
                )
              }
            >
              View All
            </button>

          </div>

          {scholarships.length === 0 ? (

            <div className="empty-card">

              <p>
                No recommendations
                yet.
              </p>

            </div>

          ) : (

            <div className="scholarship-grid">

              {scholarships
                .slice(0, 3)
                .map(
                  (
                    scholarship,
                    index
                  ) => (

                    <div
                      className="scholarship-card"
                      key={getSafeKey(
                        scholarship,
                        index,
                        "recommendation"
                      )}
                    >

                      <div className="scholarship-top">

                        <div className="scholarship-icon">
                          🎓
                        </div>

                        <span className="match-badge">
                          Recommended
                        </span>

                      </div>

                      <h3>
                        {
                          scholarship.name
                        }
                      </h3>

                      <p className="provider">
                        {
                          scholarship.provider
                        }
                      </p>

                      <div className="scholarship-info">

                        <div>
                          <span>
                            Amount
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

                        <div>
                          <span>
                            Deadline
                          </span>

                          <strong>
                            {
                              scholarship.deadline
                            }
                          </strong>
                        </div>

                      </div>

                      <button
                        className="primary-button full-button"
                        onClick={() =>
                          router.push(
                            `/scholarships/${scholarship.id}`
                          )
                        }
                      >
                        View Details
                      </button>

                      <button
                        className="small-button full-button"
                        disabled={
                          actionLoading ===
                          `save-${scholarship.id}`
                        }
                        onClick={() =>
                          saveScholarship(
                            scholarship.id
                          )
                        }
                      >
                        {actionLoading ===
                        `save-${scholarship.id}`
                          ? "Saving..."
                          : "⭐ Save"}
                      </button>

                    </div>

                  )
                )}

            </div>

          )}

        </section>

        {/* =================================================
            AI ASSISTANT
        ================================================= */}

        <section className="dashboard-section">

          <div className="ai-card">

            <div className="ai-header">

              <div className="ai-icon">
                🤖
              </div>

              <div>
                <h3>
                  AI Scholarship Assistant
                </h3>

                <p>
                  Ask questions about
                  scholarships and eligibility.
                </p>
              </div>

            </div>

            <div className="ai-input-area">

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder="Example: Which scholarships am I eligible for?"
                rows={4}
              />

              <div className="ai-button-row">

                <button
                  className="primary-button ai-button"
                  onClick={askAI}
                  disabled={loadingAI}
                >
                  {loadingAI
                    ? "Thinking..."
                    : "Ask AI"}
                </button>

              </div>

            </div>

            {aiResponse && (

              <div className="ai-response-section">

                <h3>
                  🤖 AI Response
                </h3>

                <div className="ai-response">
                  <p>
                    {aiResponse}
                  </p>
                </div>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            SAVED SCHOLARSHIPS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <h2>
                Saved Scholarships
              </h2>
            </div>

          </div>

          {savedScholarships.length === 0 ? (

            <div className="empty-card">

              <p>
                You have not saved any
                scholarships yet.
              </p>

            </div>

          ) : (

            <div className="saved-card">

              {savedScholarships.map(
                (item, index) => {

                  const savedId =
                    getSavedId(item);

                  return (

                    <div
                      className="saved-row"
                      key={getSafeKey(
                        item,
                        index,
                        "saved"
                      )}
                    >

                      <div className="saved-info">

                        <div className="saved-icon">
                          ⭐
                        </div>

                        <div>

                          <h3>
                            {
                              getScholarshipName(
                                item
                              )
                            }
                          </h3>

                          <p>
                            {
                              getScholarshipProvider(
                                item
                              )
                            }
                          </p>

                        </div>

                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >

                        <strong>
                          {
                            getScholarshipAmount(
                              item
                            )
                          }
                        </strong>

                        <button
                          className="small-button"
                          disabled={
                            actionLoading ===
                            `unsave-${savedId}`
                          }
                          onClick={() =>
                            unsaveScholarship(
                              item
                            )
                          }
                        >
                          {actionLoading ===
                          `unsave-${savedId}`
                            ? "Removing..."
                            : "Unsave"}
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            APPLICATION TRACKER
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <h2>
                Application Tracker
              </h2>
            </div>

          </div>

          {applications.length === 0 ? (

            <div className="empty-card">

              <p>
                No scholarship applications
                yet.
              </p>

            </div>

          ) : (

            <div className="tracker-card">

              <div className="application-table">

                <div className="table-header">
                  <div>
                    Scholarship
                  </div>

                  <div>
                    Status
                  </div>
                </div>

                {applications.map(
                  (
                    application,
                    index
                  ) => {

                    const applicationId =
                      getApplicationId(
                        application
                      );

                    const currentStatus =
                      application.status ||
                      "Not Applied";

                    return (

                      <div
                        className="table-row"
                        key={getSafeKey(
                          application,
                          index,
                          "application"
                        )}
                      >

                        <div>

                          <strong>
                            {
                              getScholarshipName(
                                application
                              )
                            }
                          </strong>

                          <p
                            style={{
                              margin:
                                "5px 0 0",
                              color:
                                "#718096",
                              fontSize:
                                "12px",
                            }}
                          >
                            {
                              getScholarshipProvider(
                                application
                              )
                            }
                          </p>

                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                          }}
                        >

                          <select
                            value={
                              currentStatus
                            }
                            disabled={
                              actionLoading ===
                              `application-${applicationId}`
                            }
                            onChange={(
                              event
                            ) =>
                              updateApplicationStatus(
                                application,
                                event.target
                                  .value
                              )
                            }
                            className={`status-badge ${getStatusClass(
                              currentStatus
                            )}`}
                            style={{
                              border:
                                "none",
                              cursor:
                                "pointer",
                              outline:
                                "none",
                            }}
                          >

                            <option value="Not Applied">
                              Not Applied
                            </option>

                            <option value="Applied">
                              Applied
                            </option>

                            <option value="Under Review">
                              Under Review
                            </option>

                            <option value="Selected">
                              Selected
                            </option>

                            <option value="Rejected">
                              Rejected
                            </option>

                          </select>

                          <button
                            className="small-button"
                            disabled={
                              actionLoading ===
                              `delete-application-${applicationId}`
                            }
                            onClick={() =>
                              deleteApplication(
                                application
                              )
                            }
                          >
                            {actionLoading ===
                            `delete-application-${applicationId}`
                              ? "..."
                              : "Remove"}
                          </button>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )}

        </section>

        {/* =================================================
            DOCUMENT CHECKLIST
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-title-row">

            <div>
              <h2>
                Document Checklist
              </h2>
            </div>

          </div>

          {documents.length === 0 ? (

            <div className="empty-card">

              <p>
                No documents added yet.
              </p>

            </div>

          ) : (

            <div className="documents-card">

              {documents.map(
                (
                  document,
                  index
                ) => {

                  const documentId =
                    getDocumentId(
                      document
                    );

                  const isReady =
                    Boolean(
                      document.is_ready
                    );

                  return (

                    <div
                      className="document-row"
                      key={getSafeKey(
                        document,
                        index,
                        "document"
                      )}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "12px",
                        }}
                      >

                        <span>
                          📄
                        </span>

                        <div>

                          <strong>
                            {
                              document.document_name ||
                              "Document"
                            }
                          </strong>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#9aa9b8",
                              fontSize:
                                "11px",
                            }}
                          >
                            {isReady
                              ? "Document is ready"
                              : "Document is not ready"}
                          </p>

                        </div>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >

                        <button
                          className={
                            isReady
                              ? "small-button"
                              : "small-button"
                          }
                          disabled={
                            actionLoading ===
                            `document-${documentId}`
                          }
                          onClick={() =>
                            updateDocumentStatus(
                              document,
                              !isReady
                            )
                          }
                        >
                          {actionLoading ===
                          `document-${documentId}`
                            ? "Updating..."
                            : isReady
                            ? "✓ Ready"
                            : "Mark Ready"}
                        </button>

                        <button
                          className="small-button"
                          disabled={
                            actionLoading ===
                            `delete-document-${documentId}`
                          }
                          onClick={() =>
                            deleteDocument(
                              document
                            )
                          }
                        >
                          {actionLoading ===
                          `delete-document-${documentId}`
                            ? "..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}