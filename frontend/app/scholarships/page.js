"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./scholarships.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ScholarshipsPage() {
  const router = useRouter();

  const [scholarships, setScholarships] = useState([]);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // LOAD SCHOLARSHIPS
  // ============================================================

  const loadScholarships = useCallback(async () => {
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
        params.append("sort_by", sort);
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(
        `${API_URL}/scholarship/?${params.toString()}`,
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
          `Failed to load scholarships: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Scholarship API response:",
        data
      );

      setScholarships(data.results || []);
    } catch (error) {
      console.error(
        "Scholarship loading error:",
        error
      );

      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    provider,
    minAmount,
    maxAmount,
    sort,
  ]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const loadInitialScholarships = async () => {
      await loadScholarships();
    };

    loadInitialScholarships();
  }, [loadScholarships]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = () => {
    loadScholarships();
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setProvider("");
    setMinAmount("");
    setMaxAmount("");
    setSort("");
  };

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const viewDetails = (id) => {
    router.push(`/scholarships/${id}`);
  };

  // ============================================================
  // PAGE
  // ============================================================

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

            {/* Search */}
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

            {/* Provider */}
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

            {/* Minimum Amount */}
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

            {/* Maximum Amount */}
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

            {/* Sort */}
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

                <option value="deadline">
                  Deadline: Earliest
                </option>
              </select>
            </div>

          </div>

          {/* Buttons */}
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

        {/* Results Header */}
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

        {/* No Results */}
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
                        ).toLocaleString("en-IN")}
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