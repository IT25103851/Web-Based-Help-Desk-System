import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ProtectedRoute, RoleBasedRoute, GuestOnlyRoute } from './components/ProtectedRoute';
import { Ticket } from 'lucide-react';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';
import Dashboard from './pages/Dashboard';

import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import CreateTicket from './components/CreateTicket';
import AgentDashboard from './components/AgentDashboard';
import CSATDashboard from './components/CSATDashboard';

const STAFF_ROLES = [
  ROLES.SUPPORT_AGENT,
  ROLES.TEAM_LEAD,
  ROLES.SYSTEM_ADMINISTRATOR,
];

const AGENT_ROLES = [
  ROLES.SUPPORT_AGENT,
  ROLES.TEAM_LEAD,
  ROLES.SYSTEM_ADMINISTRATOR,
];

function AppShell() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [ticketPrefill, setTicketPrefill] = useState(null);

  const handleTicketCreated = () => {
    setTicketPrefill(null);
    showToast('Ticket submitted successfully.', 'success');
    navigate('/my-tickets');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/tickets" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={STAFF_ROLES}>
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 relative overflow-hidden shadow-lg">
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-md text-[11px] font-semibold uppercase tracking-wider mb-2">
                      Live Queue Feed
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">All Support Tickets</h2>
                    <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
                      View and manage university helpdesk tickets across operational departments.
                    </p>
                  </div>
                </div>
                <TicketList onViewTicket={(id) => navigate(`/tickets/${id}`)} />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/tickets/:ticketId" element={
            <ProtectedRoute>
              <TicketDetailsWrapper />
            </ProtectedRoute>
          } />

          <Route path="/my-tickets" element={
            <ProtectedRoute>
              <MyTicketsView />
            </ProtectedRoute>
          } />

          <Route path="/create" element={
            <ProtectedRoute>
              <div className="max-w-3xl mx-auto">
                <CreateTicket
                  onTicketCreated={handleTicketCreated}
                  onOpenAuth={() => navigate('/login')}
                  prefillData={ticketPrefill}
                />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={AGENT_ROLES}>
                <AgentDashboard onViewTicket={(id) => navigate(`/tickets/${id}`)} />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/csat" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={[ROLES.SUPPORT_AGENT, ROLES.TEAM_LEAD, ROLES.MANAGER_EXECUTIVE, ROLES.SYSTEM_ADMINISTRATOR]}>
                <CSATDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/60 py-6 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>UniAssist 360 • University Support Portal</p>
        </div>
      </footer>
    </div>
  );
}

function MyTicketsView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-400" />
          <span>My Tickets</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Tickets submitted by <span className="text-blue-400 font-semibold">{user?.fullName}</span> ({user?.role?.replace('_', ' ')}).
        </p>
      </div>
      <TicketList onViewTicket={(id) => navigate(`/tickets/${id}`)} filterUserId={user?.id} />
    </>
  );
}

// Ticket details page wrapper
function TicketDetailsWrapper() {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  return (
    <TicketDetails
      ticketId={parseInt(ticketId, 10)}
      onBack={() => navigate(-1)}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
              <GuestOnlyRoute><LoginPage /></GuestOnlyRoute>
            } />
            <Route path="/register" element={
              <GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>
            } />
            <Route path="/password-reset" element={
              <GuestOnlyRoute><PasswordResetPage /></GuestOnlyRoute>
            } />
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
