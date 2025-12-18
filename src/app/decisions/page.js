"use client";
import { useEffect, useState } from "react";
import STRAFENKATALOG from "@/lib/strafenkatalog";

export default function DecisionsPage() {
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState("");
  const [cause, setCause] = useState("");
  const [customCause, setCustomCause] = useState("");
  const [penalty, setPenalty] = useState("");
  const [event, setEvent] = useState("race");
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
      alert("Please fill in all fields");
      return;
    }

    await fetch("/api/penalties", {
      method: "POST",
      body: JSON.stringify({ driverId, cause: finalCause, penalty, event }),
    });

    const driver = drivers.find(d => d.id === driverId);

    const res = await fetch("/api/decision-pdf", {
      method: "POST",
      body: JSON.stringify({
        Driver: driver.name,
        Team: driver.team.name,
        Cause: finalCause,
        Penalty: penalty,
      }),
    });

    window.open(URL.createObjectURL(await res.blob()));
  }

  const isDiscretionary = selectedCatalogEntry?.discretionary || cause === "Other";

  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">Assign Penalty</h1>
      <p className="text-gray-600 mb-8">Issue a new penalty decision and generate the official document</p>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-6">
        <div className="space-y-6">
          {/* Driver Selection */}
          <div>
            <label htmlFor="driver" className="block text-sm font-semibold text-gray-700 mb-2">
              Driver
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
          </div>

          {/* Custom Infringement Text for "Other" */}
          {cause === "Other" && (
            <div>
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

          {/* Penalty Information */}
          {selectedCatalogEntry && !isDiscretionary && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
                placeholder="Or type a custom penalty (e.g., 5-second time penalty, Warning, Reprimand)"
                onChange={e => setPenalty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
              />
            </div>
          )}
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
              <dt className="text-sm font-medium text-gray-600">Driver</dt>
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
  );
}
