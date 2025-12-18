"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DriversPage() {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    loadTeams();
    loadDrivers();
  }, []);

  async function loadTeams() {
    const data = await fetch("/api/teams").then(r => r.json());
    setTeams(data);
  }

  async function loadDrivers() {
    const data = await fetch("/api/drivers").then(r => r.json());
    setDrivers(data);
  }

  async function createDriver() {
    if (!name.trim() || !teamId) return;

    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        teamId,
        carNumber: carNumber ? parseInt(carNumber) : null
      }),
    });

    setName("");
    setCarNumber("");
    setTeamId("");
    loadDrivers();
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2 text-gray-900">Drivers</h1>
      <p className="text-gray-600 mb-8">Manage drivers and their team assignments</p>

      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Driver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <input
            type="text"
            placeholder="Driver name (e.g., Max Verstappen)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="lg:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
            onKeyPress={e => e.key === 'Enter' && createDriver()}
          />
          <input
            type="number"
            placeholder="Car # (optional)"
            value={carNumber}
            onChange={e => setCarNumber(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
            onKeyPress={e => e.key === 'Enter' && createDriver()}
          />
          <select
            value={teamId}
            onChange={e => setTeamId(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
          >
            <option value="">Select Team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button
            onClick={createDriver}
            disabled={!name.trim() || !teamId}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            Add Driver
          </button>
        </div>
        {teams.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>No teams available.</span>
            <Link href="/teams" className="font-semibold hover:underline ml-1">
              Create a team first →
            </Link>
          </div>
        ) : (
          <Link href="/teams" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Teams
          </Link>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">All Drivers ({drivers.length})</h2>
        {drivers.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No drivers yet</h3>
            <p className="text-gray-500">Get started by adding your first driver above</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drivers.map(driver => (
              <Link key={driver.id} href={`/drivers/${driver.id}`}>
                <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{driver.name}</h3>
                      {driver.carNumber && (
                        <span className="text-sm text-gray-500">#{driver.carNumber}</span>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {driver.team.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
