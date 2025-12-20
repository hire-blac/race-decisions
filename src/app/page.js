"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPenalties();
  }, []);

  async function loadPenalties() {
    try {
      const data = await fetch("/api/penalties").then(r => r.json());
      setPenalties(data);
    } catch (error) {
      console.error("Error loading penalties:", error);
    } finally {
      setLoading(false);
    }
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

  const sections = [
    {
      title: "Teams",
      description: "Create and manage racing teams in the championship",
      href: "/teams",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Drivers",
      description: "Add drivers and assign them to their respective teams",
      href: "/drivers",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Penalties",
      description: "View complete history of all issued penalty decisions",
      href: "/penalties",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Decisions",
      description: "Issue new penalty decisions and generate official documents",
      href: "/decisions",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-red-500 to-red-600",
    },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Race Decision System
        </h1>
        <p className="text-gray-700 text-xl max-w-2xl mx-auto">
          Professional penalty management system for racing championships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {sections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="group block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${section.gradient} rounded-xl mb-4 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              {section.icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {section.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.description}</p>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open</span>
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Quick Start Guide</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Add racing teams in the <strong>Teams</strong> section</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Register drivers and assign them to teams in <strong>Drivers</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Issue penalty decisions in the <strong>Decisions</strong> section</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Review all penalties in the <strong>Penalties</strong> history</span>
            </li>
          </ol>
        </div>

        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Automated penalty catalog with standard decisions</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Discretionary penalty options for unique cases</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>PDF document generation for official records</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Complete history tracking of all decisions</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Penalties Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recent Penalties</h2>
            <p className="text-gray-600 mt-1">Quick access to penalty decisions with PDF generation</p>
          </div>
          {penalties.length > 0 && (
            <Link
              href="/penalties"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading penalties...</p>
          </div>
        ) : penalties.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No penalties recorded yet</h3>
            <p className="text-gray-500 mb-4">Start by issuing your first penalty decision</p>
            <Link
              href="/decisions"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Issue Penalty
            </Link>
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
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
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
    </div>
  );
}
