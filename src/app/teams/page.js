"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    const data = await fetch("/api/teams").then(r => r.json());
    setTeams(data);
  }

  async function createTeam() {
    if (!name.trim()) return;

    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    loadTeams();
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2 text-gray-900">Teams</h1>
      <p className="text-gray-600 mb-8">Manage racing teams in the championship</p>

      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Team</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter team name (e.g., Red Bull Racing)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
            onKeyPress={e => e.key === 'Enter' && createTeam()}
          />
          <button
            onClick={createTeam}
            disabled={!name.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
          >
            Add Team
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">All Teams ({teams.length})</h2>
        {teams.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No teams yet</h3>
            <p className="text-gray-500">Get started by adding your first team above</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map(team => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{team.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{team.drivers?.length || 0} drivers</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
