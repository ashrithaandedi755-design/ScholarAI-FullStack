export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-blue-600">
            ScholarAI
          </h1>

          <div className="flex gap-3">
            <a
              href="/login"
              className="rounded-lg border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50"
            >
              Login
            </a>

            <a
              href="/signup"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
          Find Scholarships That Match You
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          ScholarAI helps students discover scholarships based on their
          education, state, category, and income.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Get Started
          </a>

          <a
            href="/scholarships"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Explore Scholarships
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Student Profile
            </h3>
            <p className="mt-3 text-gray-600">
              Create your profile with your education, state, category, and
              income details.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Scholarship Matching
            </h3>
            <p className="mt-3 text-gray-600">
              Discover scholarships that match your eligibility information.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              AI Assistant
            </h3>
            <p className="mt-3 text-gray-600">
              Ask questions about scholarships and get explanations using
              ScholarAI&apos;s AI assistant.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © 2026 ScholarAI. All rights reserved.
      </footer>
    </main>
  );
}