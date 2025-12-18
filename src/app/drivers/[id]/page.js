"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [driver, setDriver] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
  }, [params.id]);

  async function loadDriverData() {
    try {
      // Fetch driver details
      const driversRes = await fetch("/api/drivers");
      const drivers = await driversRes.json();
      const foundDriver = drivers.find(d => d.id === params.id);

      if (!foundDriver) {
        router.push("/drivers");
        return;
      }

      setDriver(foundDriver);

      // Fetch all penalties and filter for this driver
      const penaltiesRes = await fetch("/api/penalties");
      const allPenalties = await penaltiesRes.json();
      const driverPenalties = allPenalties.filter(p => p.driverId === params.id);
      setPenalties(driverPenalties);
    } catch (error) {
      console.error("Error loading driver data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generatePDF(penalty) {
    try {
      const res = await fetch("/api/decision-pdf", {
        method: "POST",
        body: JSON.stringify({
          Driver: driver.name,
          Team: driver.team?.name || "No Team",
          Cause: penalty.cause,
          Penalty: penalty.penalty,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        window.open(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <div className="max-w-5xl">
      {/* Back Button */}
      <Link
        href="/drivers"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 font-medium"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Drivers
      </Link>

      {/* Driver Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{driver.name}</h1>
              {driver.carNumber && (
                <span className="text-2xl font-bold text-gray-400">#{driver.carNumber}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-semibold text-lg">
                {driver.team?.name || "No Team"}
              </span>
            </div>
          </div>
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
            <dt className="text-sm font-medium text-red-800">Total Penalties</dt>
            <dd className="mt-1 text-3xl font-bold text-red-900">{penalties.length}</dd>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
            <dt className="text-sm font-medium text-amber-800">Discretionary</dt>
            <dd className="mt-1 text-3xl font-bold text-amber-900">
              {penalties.filter(p => p.discretionary).length}
            </dd>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <dt className="text-sm font-medium text-green-800">Standard</dt>
            <dd className="mt-1 text-3xl font-bold text-green-900">
              {penalties.filter(p => !p.discretionary).length}
            </dd>
          </div>
        </div>
      </div>

      {/* Penalties List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Penalty History</h2>

        {penalties.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No penalties</h3>
            <p className="text-gray-500">This driver has a clean record</p>
          </div>
        ) : (
          <div className="space-y-4">
            {penalties.map((penalty, index) => (
              <div
                key={penalty.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{penalties.length - index}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      penalty.event === 'race' ? 'bg-red-100 text-red-700' :
                      penalty.event === 'qualifying' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {penalty.event.charAt(0).toUpperCase() + penalty.event.slice(1)}
                    </span>
                    {penalty.discretionary && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                        Discretionary
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(penalty.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">Infringement</dt>
                    <dd className="text-base font-semibold text-gray-900">{penalty.cause}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600 mb-1">Penalty</dt>
                    <dd className="text-base font-semibold text-red-700">{penalty.penalty}</dd>
                  </div>
                </dl>

                <button
                  onClick={() => generatePDF(penalty)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors text-sm inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
