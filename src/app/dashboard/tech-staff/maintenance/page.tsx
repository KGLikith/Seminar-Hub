"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Plus, AlertCircle } from "lucide-react"

interface MaintenanceReport {
  id?: string
  date: string
  hallName: string
  issue: string
  priority: "low" | "medium" | "high"
}

export default function MaintenanceReports() {
  const [reports, setReports] = useState<MaintenanceReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hallName: "",
    issue: "",
    priority: "medium" as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.hallName.trim() || !formData.issue.trim()) {
      return
    }
    setReports([...reports, { ...formData, id: Date.now().toString() }])
    setFormData({
      date: new Date().toISOString().split("T")[0],
      hallName: "",
      issue: "",
      priority: "medium",
    })
    setShowForm(false)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-5 h-5" />
      case "medium":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-l-4 border-red-500 text-red-900"
      case "medium":
        return "bg-amber-50 border-l-4 border-amber-500 text-amber-900"
      case "low":
        return "bg-blue-50 border-l-4 border-blue-500 text-blue-900"
      default:
        return "bg-slate-50 border-l-4 border-slate-500 text-slate-900"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800"
      case "medium":
        return "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800"
      case "low":
        return "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800"
      default:
        return "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <div className="px-4 md:px-8 py-8 max-w-4xl mx-auto">
        <div className="mb-12 fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Maintenance Reports</h1>
          <p className="text-lg text-slate-600">Log and track maintenance issues for all halls</p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "New Report"}
          </button>
          {reports.length > 0 && (
            <p className="text-sm text-slate-600">
              {reports.length} {reports.length === 1 ? "report" : "reports"} logged
            </p>
          )}
        </div>

        {showForm && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 mb-8 fade-in shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Hall Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Auditorium A"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                    value={formData.hallName}
                    onChange={(e) => setFormData({ ...formData, hallName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Issue Description</label>
                <textarea
                  required
                  placeholder="Describe the maintenance issue in detail..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none bg-white"
                  rows={4}
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Priority Level</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="low">Low - Can be scheduled</option>
                  <option value="medium">Medium - Should address soon</option>
                  <option value="high">High - Urgent attention needed</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Submit Report
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report, idx) => (
              <div
                key={report.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`fade-in rounded-lg p-6 transition-all duration-300 hover:shadow-md ${getPriorityColor(report.priority)}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-current">{report.hallName}</h3>
                    <p className="text-sm text-current text-opacity-75 mt-1">{report.date}</p>
                  </div>
                  <div className={getPriorityBadge(report.priority)}>
                    {getPriorityIcon(report.priority)}
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                  </div>
                </div>
                <p className="text-current leading-relaxed">{report.issue}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No maintenance reports yet</p>
              <p className="text-slate-500 text-sm mt-2">Add a new report to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
