"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./scholarships.css";

const API_URL = "http://127.0.0.1:8000";

export default function ScholarshipsPage() {
  const router = useRouter();

  const [scholarships, setScholarships] = useState([]);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // Load scholarships with filters
  const loadScholarships = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (provider.trim()) {
        params.append("provider", provider.trim());
      }

      if (minAmount) {
        params.append("min_amount", minAmount);
      }

      if (maxAmount) {
        params.append("max_amount", maxAmount);
      }

      if (sort) {
        params.append("sort", sort);
      }

      const response = await fetch(
        `${API_URL}/scholarship/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load scholarships");
      }

      const data = await response.json();

      // Backend returns scholarships inside "results"
      setScholarships(data.results || []);
    } catch (error) {
      console.error(
        "Scholarship loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial loading
  useEffect(() => {
    const loadInitialScholarships = async () => {
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
          throw new Error("Failed to load scholarships");
        }

        const data = await response.json();

        // Backend returns scholarships inside "results"
        setScholarships(data.results || []);
      } catch (error) {
        console.error(
          "Scholarship loading error:",
          error
        );
      }
    };

    loadInitialScholarships();
  }, [token]);

  // Search button
  const handleSearch = () => {
    loadScholarships();
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setProvider("");
    setMinAmount("");
    setMaxAmount("");
    setSort("");

    setTimeout(() => {
      loadScholarships();
    }, 0);
  };

  // View scholarship details
  const viewDetails = (id) => {
    router.push(`/scholarships/${id}`);
  };

  return (
    <main className="scholarships-page">
      <div className="scholarships-container">

        {/* Page Header */}
        <div className="scholarships-header">
          <h1>Scholarship Explorer</h1>

          <p>
            Find scholarships that match your
            education, category and financial needs.
          </p>
        </div>

        {/* Filters */}
        <div className="filter-section">

          <div className="filter-row">

            <div className="filter-group">
              <label htmlFor="search">
                Search
              </label>

              <input
                id="search"
                type="text"
                placeholder="Search scholarship..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="provider">
                Provider
              </label>

              <input
                id="provider"
                type="text"
                placeholder="Provider name"
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value)
                }
              />
            </div>

          </div>

          <div className="filter-row">

            <div className="filter-group">
              <label htmlFor="minAmount">
                Minimum Amount
              </label>

              <input
                id="minAmount"
                type="number"
                placeholder="Minimum amount"
                value={minAmount}
                onChange={(e) =>
                  setMinAmount(e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxAmount">
                Maximum Amount
              </label>

              <input
                id="maxAmount"
                type="number"
                placeholder="Maximum amount"
                value={maxAmount}
                onChange={(e) =>
                  setMaxAmount(e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label htmlFor="sort">
                Sort
              </label>

              <select
                id="sort"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
              >
                <option value="">
                  Default
                </option>

                <option value="amount_asc">
                  Amount: Low to High
                </option>

                <option value="amount_desc">
                  Amount: High to Low
                </option>

                <option value="deadline_asc">
                  Deadline: Earliest
                </option>

                <option value="deadline_desc">
                  Deadline: Latest
                </option>
              </select>
            </div>

          </div>

          <div className="filter-buttons">

            <button
              className="search-button"
              onClick={handleSearch}
            >
              Search
            </button>

            <button
              className="clear-button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>

        </div>

        {/* Results */}
        <div className="results-header">
          <h2>Available Scholarships</h2>

          <p>
            {scholarships.length} scholarship
            {scholarships.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="loading">
            Loading scholarships...
          </p>
        )}

        {/* No results */}
        {!loading &&
          scholarships.length === 0 && (
            <div className="no-results">
              <h3>No scholarships found</h3>

              <p>
                Try changing your search or
                filters.
              </p>
            </div>
          )}

        {/* Scholarship Cards */}
        {!loading &&
          scholarships.length > 0 && (
            <div className="scholarship-grid">

              {scholarships.map((scholarship) => (
                <div
                  className="explorer-card"
                  key={scholarship.id}
                >

                  <h3>
                    {scholarship.name}
                  </h3>

                  <p className="provider">
                    Provider:{" "}
                    {scholarship.provider}
                  </p>

                  <p>
                    {scholarship.description}
                  </p>

                  <div className="scholarship-info">

                    <div>
                      <strong>
                        Amount
                      </strong>

                      <span>
                        ₹
                        {Number(
                          scholarship.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div>
                      <strong>
                        Deadline
                      </strong>

                      <span>
                        {scholarship.deadline}
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="details-button"
                    onClick={() =>
                      viewDetails(
                        scholarship.id
                      )
                    }
                  >
                    View Details
                  </button>

                </div>
              ))}

            </div>
          )}

      </div>
    </main>
  );
}