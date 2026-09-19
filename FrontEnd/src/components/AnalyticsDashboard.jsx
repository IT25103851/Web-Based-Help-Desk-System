import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8080/api';

const priorityColors = {
  CRITICAL: 'bg-rose-500',
  HIGH: 'bg-amber-500',
  MEDIUM: 'bg-indigo-500',
  LOW: 'bg-emerald-500',
};

const statusColors = {
  OPEN: 'bg-rose-500',
  IN_PROGRESS: 'bg-amber-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-500',
  REOPENED: 'bg-purple-500',
};

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
    fetchComments();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [sumRes, agentRes] = await Promise.all([
        axios.get(`${API}/analytics/summary`),
        axios.get(`${API}/analytics/agent-performance`),
      ]);
      setSummary(sumRes.data);
      setAgentPerformance(agentRes.data);
    } catch {
      showToast('Failed to load analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await axios.get(`${API}/analytics/comments`);
      setComments(res.data);
    } catch {
      showToast('Failed to load analytics insights.', 'error');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${API}/analytics/comments`, { content: newComment.trim() });
      setNewComment('');
      showToast('💬 Insight added.', 'success');
      fetchComments();
    } catch {
      showToast('Failed to add insight.', 'error');
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    try {
      await axios.put(`${API}/analytics/comments/${id}`, { content: editText.trim() });
      showToast('✏️ Insight updated.', 'success');
      cancelEdit();
      fetchComments();
    } catch {
      showToast('Failed to update insight.', 'error');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Delete this insight? This cannot be undone.')) return;
    try {
      await axios.delete(`${API}/analytics/comments/${id}`);
      showToast('🗑️ Insight deleted.', 'success');
      fetchComments();
    } catch {
      showToast('Failed to delete insight.', 'error');
    }
  };

  const canModify = (comment) => {
    if (!user) return false;
    return comment.author?.id === user.id || user.role === 'ADMIN' || user.role === 'SYSTEM_ADMINISTRATOR';
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/analytics/export/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `university_helpdesk_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('📊 CSV Report downloaded successfully!', 'success');
    } catch {
      showToast('Failed to export CSV report.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-sm">Computing analytics & performance metrics...</p>
      </div>
    );
  }

  const total = summary?.totalTickets || 0;
  const resolutionRate = total > 0 ? Math.round(((summary?.resolvedTickets || 0) / total) * 100) : 0;
  const activeBacklog = (summary?.openTickets || 0) + (summary?.inProgressTickets || 0);

  return (
    <div className="space-y-8 animate-fade-in print:text-black print:bg-white print:p-0">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            Executive Intelligence
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Analytics & Report Center</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time system health, operational bottlenecks, and agent performance reviews.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <span>📥</span>
            <span>{exporting ? 'Generating CSV...' : 'Export CSV Report'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <span>🖨️</span>
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-black">University Help Desk — System Analytics Report</h1>
        <p className="text-xs text-gray-600">Generated on {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-2 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between text-slate-400 print:text-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
            <span className="text-xl">📊</span>
          </div>
          <div className="text-3xl font-extrabold text-white print:text-black">{total}</div>
          <p className="text-[11px] text-slate-400">Total tickets logged in system</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-2 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between text-slate-400 print:text-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider">Resolution Rate</span>
            <span className="text-xl">🎯</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 print:text-emerald-700">{resolutionRate}%</div>
          <p className="text-[11px] text-slate-400">{summary?.resolvedTickets || 0} of {total} tickets resolved</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-2 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between text-slate-400 print:text-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider">Active Backlog</span>
            <span className="text-xl">⏳</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 print:text-amber-700">{activeBacklog}</div>
          <p className="text-[11px] text-slate-400">{summary?.openTickets || 0} Open, {summary?.inProgressTickets || 0} In Progress</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-2 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between text-slate-400 print:text-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider">CSAT Score</span>
            <span className="text-xl">⭐</span>
          </div>
          <div className="text-3xl font-extrabold text-yellow-400 print:text-yellow-700">
            {summary?.avgCsatRating ? `${summary.avgCsatRating} / 5.0` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400">
            {summary?.satisfactionRatePercentage ? `${summary.satisfactionRatePercentage}% satisfaction rate` : 'No feedback ratings yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-4 print:border-gray-300 print:bg-gray-50">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 print:text-black">
            <span>🏷️</span> Category Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(summary?.categoryDistribution || {}).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300 print:text-gray-800">
                    <span>{cat}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden print:bg-gray-200">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-4 print:border-gray-300 print:bg-gray-50">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 print:text-black">
            <span>⚡</span> Priority Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(summary?.priorityDistribution || {}).map(([prio, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={prio} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300 print:text-gray-800">
                    <span className="font-semibold">{prio}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden print:bg-gray-200">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${priorityColors[prio] || 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-4 print:border-gray-300 print:bg-gray-50">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 print:text-black">
            <span>🔄</span> Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(summary?.statusDistribution || {}).map(([st, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300 print:text-gray-800">
                    <span className="font-semibold">{st.replace('_', ' ')}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden print:bg-gray-200">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${statusColors[st] || 'bg-slate-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400">Avg Resolution Speed:</span>
            <span className="font-bold text-indigo-300 print:text-indigo-800">
              ⏱️ {summary?.avgResolutionTimeHours ? `${summary.avgResolutionTimeHours} hrs` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden print:border-gray-300">
        <div className="p-5 border-b border-slate-700/60 bg-slate-800 flex items-center justify-between print:bg-gray-100">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 print:text-black">
            <span>🏆</span> Support Agent Performance Leaderboard
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{agentPerformance.length} Active Staff</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 border-b border-slate-700/60 uppercase tracking-wider text-[10px] print:bg-gray-200 print:text-black">
                <th className="py-3 px-4 font-bold">Rank</th>
                <th className="py-3 px-4 font-bold">Agent Name</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold text-center">Assigned</th>
                <th className="py-3 px-4 font-bold text-center">Resolved</th>
                <th className="py-3 px-4 font-bold text-center">Resolution %</th>
                <th className="py-3 px-4 font-bold text-center">CSAT Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40 text-slate-200 print:divide-gray-200 print:text-black">
              {agentPerformance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">No support agent data available.</td>
                </tr>
              ) : (
                agentPerformance.map((agent, index) => {
                  const resPct = agent.assignedTicketsCount > 0
                    ? Math.round((agent.resolvedTicketsCount / agent.assignedTicketsCount) * 100)
                    : 0;

                  return (
                    <tr key={agent.agentId} className="hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 font-bold text-indigo-400">#{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-white print:text-black">
                        {agent.agentName}
                        <span className="block text-[10px] text-slate-400 font-normal">{agent.email}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 print:text-gray-700">{agent.department}</td>
                      <td className="py-3 px-4 text-center font-bold">{agent.assignedTicketsCount}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400 print:text-emerald-700">
                        {agent.resolvedTicketsCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-900 rounded-full font-extrabold text-[11px] print:bg-gray-100">
                          {resPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-yellow-400 print:text-yellow-700">
                        {agent.avgCsatRating > 0 ? `⭐ ${agent.avgCsatRating}` : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden print:border-gray-300">
        <div className="p-5 border-b border-slate-700/60 bg-slate-800 flex items-center justify-between print:bg-gray-100">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 print:text-black">
            <span>📝</span> Manager Insights & Comments
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{comments.length} Insight{comments.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3 print:hidden">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add an insight or note about this data, e.g. 'Response times spiked in Week 3 due to exam season load.'"
              rows={2}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 self-start sm:self-stretch"
            >
              {posting ? 'Posting...' : 'Add Insight'}
            </button>
          </form>

          {commentsLoading ? (
            <p className="text-slate-500 text-sm text-center py-6">Loading insights...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No insights added yet. Be the first to annotate this data.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
                  {editingId === c.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{c.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {c.author?.fullName || c.author?.username || 'Unknown'} ·{' '}
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                          {c.updatedAt ? ' (edited)' : ''}
                        </span>
                        {canModify(c) && (
                          <div className="flex gap-2 print:hidden">
                            <button
                              onClick={() => startEdit(c)}
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}