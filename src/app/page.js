"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import STRAFENKATALOG from "@/lib/strafenkatalog";

export default function Home() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [cause, setCause] = useState("");
  const [customCause, setCustomCause] = useState("");
  const [penalty, setPenalty] = useState("");
  const [event, setEvent] = useState("race");
  const [trackName, setTrackName] = useState("");
  const [competitionName, setCompetitionName] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedCatalogEntry, setSelectedCatalogEntry] = useState(null);
  const [existingPenalties, setExistingPenalties] = useState([]);

  useEffect(() => {
    fetch("/api/drivers").then(r => r.json()).then(setDrivers);
    fetch("/api/penalties").then(r => r.json()).then(data => {
      // Get penalties from STRAFENKATALOG - extract from all events
      const catalogPenalties = STRAFENKATALOG.flatMap(c => [
        c.penalty.training,
        c.penalty.qualifying,
        c.penalty.race
      ]);

      // Get custom penalties from database (ones not in catalog)
      const dbPenalties = data.map(p => p.penalty);

      // Combine and deduplicate
      const allPenalties = [...new Set([...catalogPenalties, ...dbPenalties])];

      // Sort alphabetically
      allPenalties.sort();

      setExistingPenalties(allPenalties);
    });
  }, []);

  const handleDriverChange = (e) => {
    const id = e.target.value;
    setDriverId(id);
    setSelectedDriver(drivers.find(d => d.id === id));
  };

  const handleCauseChange = (e) => {
    const selectedCause = e.target.value;
    setCause(selectedCause);
    const catalogEntry = STRAFENKATALOG.find(c => c.cause === selectedCause);
    setSelectedCatalogEntry(catalogEntry);
    if (catalogEntry && !catalogEntry.discretionary) {
      setPenalty(catalogEntry.penalty[event]);
    } else {
      setPenalty("");
    }
  };

  const handleEventChange = (e) => {
    const selectedEvent = e.target.value;
    setEvent(selectedEvent);
    // Update penalty if a catalog entry is selected
    if (selectedCatalogEntry && !selectedCatalogEntry.discretionary) {
      setPenalty(selectedCatalogEntry.penalty[selectedEvent]);
    }
  };

  async function submit() {
    const finalCause = cause === "Other" ? customCause : cause;

    if (!driverId || !finalCause || !penalty) {
      alert("Please fill in all required fields");
      return;
    }

    await fetch("/api/penalties", {
      method: "POST",
      body: JSON.stringify({ driverId, cause: finalCause, penalty, event, trackName, competitionName }),
    });

    const driver = drivers.find(d => d.id === driverId);

    const res = await fetch("/api/decision-pdf", {
      method: "POST",
      body: JSON.stringify({
        Driver: driver.name,
        carNumber: driver.carNumber,
        Team: driver.team.name,
        Cause: finalCause,
        Penalty: penalty,
        event: event,
        trackName: trackName,
        competitionName: competitionName,
        discretionary: isDiscretionary,
      }),
    });

    window.open(URL.createObjectURL(await res.blob()));
  }

  const isDiscretionary = selectedCatalogEntry?.discretionary || cause === "Other";

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
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          Race Decision System
        </h3>
        <p className="text-gray-700 text-xl max-w-2xl mx-auto">
          Professional penalty management system for racing championships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {sections.map(section => (
          <Link
            key={section.href}
            href={section.href}
            className="group block p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${section.gradient} rounded-xl mb-4 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              {section.icon}
            </div>
            <h2 className="text-sm font-semibold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
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

      {/* Create Decision Form */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
      
          <h3 className="text-center text-2xl font-bold mb-2 text-gray-900">Assign Penalty</h3>
          <p className="text-center text-gray-600 mb-8">Issue a new penalty decision and generate the official document</p>

          <div className="space-y-6">
            {/* Driver, Event, and Track in a single row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Driver Selection */}
              <div>
                <label htmlFor="driver" className="block text-sm font-semibold text-gray-700 mb-2">
                  Fahrer
                </label>
                <select
                  id="driver"
                  value={driverId}
                  onChange={handleDriverChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
                >
                  <option value="">Select a driver...</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.team?.name || "No Team"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Selection */}
              <div>
                <label htmlFor="event" className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  id="event"
                  value={event}
                  onChange={handleEventChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
                >
                  <option value="race">Race</option>
                  <option value="qualifying">Qualifying</option>
                  <option value="training">Training</option>
                </select>
              </div>

              {/* Track Name */}
              <div>
                <label htmlFor="trackName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Strecke
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  id="trackName"
                  type="text"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  placeholder="e.g., Hockenheim, Nürburgring"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                />
              </div>
            </div>

            {/* Infringement and Penalty in a single row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cause Selection */}
              <div>
                <label htmlFor="cause" className="block text-sm font-semibold text-gray-700 mb-2">
                  Infringement
                </label>
                <select
                  id="cause"
                  value={cause}
                  onChange={handleCauseChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
                >
                  <option value="">Select infringement...</option>
                  {STRAFENKATALOG.map(c => (
                    <option key={c.cause} value={c.cause}>{c.cause}</option>
                  ))}
                  <option value="Other">Other (Discretionary)</option>
                </select>

                {/* Custom Infringement Text for "Other" */}
                {cause === "Other" && (
                  <div className="mt-4">
                    <label htmlFor="customCause" className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Infringement Description
                    </label>
                    <input
                      id="customCause"
                      type="text"
                      value={customCause}
                      placeholder="e.g., Unsafe release from pit lane"
                      onChange={e => setCustomCause(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Penalty Information */}
              {selectedCatalogEntry && !isDiscretionary && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col justify-center">
                  <p className="text-sm font-semibold text-green-800 mb-1">Standard Penalty ({event.charAt(0).toUpperCase() + event.slice(1)})</p>
                  <p className="text-lg font-bold text-green-900">{selectedCatalogEntry.penalty[event]}</p>
                </div>
              )}

              {/* Discretionary Penalty Selection/Input */}
              {isDiscretionary && cause && (
                <div>
                  <label htmlFor="penalty" className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="inline-flex items-center gap-2">
                      Penalty
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                        Discretionary
                      </span>
                    </span>
                  </label>
                  <select
                    id="penaltySelect"
                    value={penalty}
                    onChange={e => setPenalty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm mb-2"
                  >
                    <option value="">Select from existing penalties or type custom...</option>
                    {existingPenalties.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    id="penalty"
                    type="text"
                    value={penalty}
                    placeholder="Or type a custom penalty (e.g., 5-second time penalty)"
                    onChange={e => setPenalty(e.target.value)}
                    className="md:mt-9 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={submit}
              disabled={!driverId || !cause || !penalty}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Generate Decision Document (PDF)
            </button>
          </div>
        </div>

        {/* Preview Card */}
        {selectedDriver && cause && penalty && (cause !== "Other" || customCause) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Decision Preview</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">Fahrer</dt>
                <dd className="mt-1 text-base font-semibold text-gray-900">{selectedDriver.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Team</dt>
                <dd className="mt-1 text-base font-semibold text-gray-900">{selectedDriver.team?.name || "No Team"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Infringement</dt>
                <dd className="mt-1 text-base font-semibold text-gray-900">{cause === "Other" ? customCause : cause}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">Penalty</dt>
                <dd className="mt-1 text-base font-semibold text-gray-900">{penalty}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
