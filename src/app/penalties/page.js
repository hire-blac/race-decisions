"use client";
import { useEffect, useState } from "react";

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    loadPenalties();
  }, []);

  async function loadPenalties() {
    const data = await fetch("/api/penalties").then(r => r.json());
    setPenalties(data);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  async function generatePDF(penalty) {
    try {
      const res = await fetch("/api/decision-pdf", {
        method: "POST",
        body: JSON.stringify({
          Driver: penalty.driver.name,
          carNumber: penalty.driver.carNumber,
          Team: penalty.driver.team.name,
          event: penalty.event,
          trackName: penalty.trackName,
          competitionName: penalty.competitionName,
          Cause: penalty.cause,
          Penalty: penalty.penalty,
          discretionary: penalty.discretionary,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        window.open(URL.createObjectURL(blob));
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  }

  const discretionaryCount = penalties.filter(p => p.discretionary).length;
  const standardCount = penalties.length - discretionaryCount;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Penalties</h1>
          <p className="text-gray-600">View all issued penalty decisions</p>
        </div>
        {penalties.length > 0 && (
          <div className="flex gap-4 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{penalties.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{standardCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Standard</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{discretionaryCount}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Discretionary</div>
            </div>
          </div>
        )}
      </div>

      {penalties.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No penalties recorded yet</h3>
          <p className="text-gray-500">Penalty decisions will appear here once issued</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Track</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Infringement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Penalty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {penalties.map(penalty => (
                  <tr key={penalty.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(penalty.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{penalty.driver.name}</div>
                      {penalty.driver.carNumber && (
                        <div className="text-xs text-gray-500">#{penalty.driver.carNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {penalty.driver.team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        penalty.event === 'race' ? 'bg-red-100 text-red-800 border border-red-200' :
                        penalty.event === 'qualifying' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {penalty.event.charAt(0).toUpperCase() + penalty.event.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {penalty.trackName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {penalty.cause}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {penalty.penalty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        penalty.discretionary
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {penalty.discretionary ? 'Discretionary' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => generatePDF(penalty)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
