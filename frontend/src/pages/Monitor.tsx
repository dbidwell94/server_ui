import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import TerminalView from "../components/TerminalView";
import type { LogEntry } from "../components/TerminalView";

export default function Monitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const logIdRef = useRef(0);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    // Auto-scroll is now handled by TerminalView component
  }, [logs]);

  // Connect to server-sent events for logs
  useEffect(() => {
    const evtSource = new EventSource("/api/steamcmd/stdout");

    evtSource.onmessage = (evt) => {
      try {
        const message = evt.data;
        const newLog: LogEntry = {
          id: logIdRef.current++,
          timestamp: new Date().toISOString(),
          source: "steamcmd",
          level: "info",
          message: message,
        };
        setLogs((prev) => [...prev, newLog].slice(-1000)); // Keep last 1000 logs
      } catch (error) {
        console.error("Failed to parse log entry:", error);
      }
    };

    evtSource.onerror = () => {
      console.error("Log stream error");
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, []);

  // Filter logs based on selected server and level
  const filteredLogs = logs.filter((log) => {
    const serverMatch = selectedServer === "all" || log.source === selectedServer;
    const levelMatch = selectedLevel === "all" || log.level === selectedLevel;
    return serverMatch && levelMatch;
  });

  // Get unique servers from logs
  const servers = Array.from(new Set(logs.map((log) => log.source)));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Server Monitor</h1>
          <p className="text-gray-600">View real-time logs from your servers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="server" className="block text-sm font-medium text-gray-700 mb-2">
                Server
              </label>
              <select
                id="server"
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Servers</option>
                {servers.map((server) => (
                  <option key={server} value={server}>
                    {server}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Log Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs Display - Terminal Style */}
        <TerminalView
          logs={filteredLogs}
          isEmpty={filteredLogs.length === 0}
          emptyMessage={logs.length === 0 ? "Waiting for logs..." : "No logs match the selected filters"}
          title="steamcmd"
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>
            &copy; 2026 Devin Bidwell - Server UI. Built with Rust and React.
          </p>
        </div>
      </footer>
    </div>
  );
}
