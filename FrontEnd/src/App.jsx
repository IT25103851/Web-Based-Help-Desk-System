import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import CreateTicket from './components/CreateTicket';
import AgentDashboard from './components/AgentDashboard';
import CSATDashboard from './components/CSATDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import KnowledgeBase from './components/KnowledgeBase';
import AiChatbotModal from './components/AiChatbotModal';
import Login from './components/Login';
import Register from './components/Register';

const AGENT_ROLES = ['SUPPORT_AGENT', 'DEPARTMENT_MANAGER', 'ADMIN'];

function MainApp() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [ticketPrefill, setTicketPrefill] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setTicketPrefill(null);
    setActiveTab('tickets');
    showToast('🚀 Ticket submitted successfully!', 'success');
  };

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setActiveTab('details');
  };

  const handleBackFromDetails = () => {
    setSelectedTicketId(null);
    setActiveTab('tickets');
  };

  const handleAuthSuccess = () => {
    setActiveTab('tickets');
    showToast('👋 Signed in successfully!', 'success');
  };

  const handleSetTab = (tab) => {
    // Clear selected ticket when navigating away from details
    if (tab !== 'details') setSelectedTicketId(null);
    setActiveTab(tab);
  };

  const handleDeflectionToTicket = ({ title, description }) => {
    setTicketPrefill({ title, description });
    setActiveTab('create');
    showToast('🤖 Prefilled ticket from AI Chatbot deflection.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        onOpenAuth={(tab) => setActiveTab(tab)}
        onSelectTicket={handleViewTicket}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── All Tickets ── */}
        {activeTab === 'tickets' && (
          <>
            <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-800/80 to-purple-900/40 border border-slate-700/50 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                  Live Ticket Feed
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">University IT Helpdesk Portal</h2>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                  JWT authenticated portal — click any ticket to view details, join discussions, or consult our AI Knowledge Assistant.
                </p>
              </div>
              <div className="absolute right-4 bottom-0 opacity-10 text-9xl pointer-events-none select-none">🏛️</div>
            </div>
            <TicketList refreshTrigger={refreshTrigger} onViewTicket={handleViewTicket} />
          </>
        )}

        {/* ── Knowledge Base Portal ── */}
        {activeTab === 'kb' && (
          <KnowledgeBase />
        )}

        {/* ── My Tickets (filtered view for the logged-in user) ── */}
        {activeTab === 'mytickets' && isAuthenticated && (
          <>
            <div className="mb-6 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/50 shadow-lg">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">🗂️ My Tickets</h2>
              <p className="text-slate-400 text-sm mt-1">Tickets you submitted as <span className="text-indigo-400 font-semibold">{user?.fullName}</span>.</p>
            </div>
            <TicketList refreshTrigger={refreshTrigger} onViewTicket={handleViewTicket} filterUserId={user?.id} />
          </>
        )}

        {/* ── Create Ticket ── */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <CreateTicket
              onTicketCreated={handleTicketCreated}
              onOpenAuth={(tab) => setActiveTab(tab)}
              prefillData={ticketPrefill}
            />
          </div>
        )}

        {/* ── Ticket Details ── */}
        {activeTab === 'details' && selectedTicketId && (
          <TicketDetails ticketId={selectedTicketId} onBack={handleBackFromDetails} />
        )}

        {/* ── Agent Dashboard ── */}
        {activeTab === 'dashboard' && isAuthenticated && AGENT_ROLES.includes(user?.role) && (
          <AgentDashboard onViewTicket={handleViewTicket} />
        )}

        {/* ── CSAT Dashboard ── */}
        {activeTab === 'csat' && isAuthenticated && AGENT_ROLES.includes(user?.role) && (
          <CSATDashboard />
        )}

        {/* ── Analytics & Reports Dashboard ── */}
        {activeTab === 'analytics' && isAuthenticated && AGENT_ROLES.includes(user?.role) && (
          <AnalyticsDashboard />
        )}

        {/* ── Login ── */}
        {activeTab === 'login' && (
          <div className="py-6">
            <Login onSuccess={handleAuthSuccess} onSwitchToRegister={() => setActiveTab('register')} />
          </div>
        )}

        {/* ── Register ── */}
        {activeTab === 'register' && (
          <div className="py-6">
            <Register onSuccess={handleAuthSuccess} onSwitchToLogin={() => setActiveTab('login')} />
          </div>
        )}
      </main>

      {/* ── Floating AI Chatbot Assistant Widget (Global across all tabs) ── */}
      <AiChatbotModal onNavigateToCreateTicket={handleDeflectionToTicket} />

      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>University Help Desk System • Module 6: Analytics Dashboard, Charts & Report Generator</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
