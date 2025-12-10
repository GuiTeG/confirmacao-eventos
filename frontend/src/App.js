// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import PrivateRoute from "./routes/PrivateRoute";

import EventDetails from "./pages/EventDetails";          // detalhes do evento (dono)
import ConfirmAttendance from "./pages/ConfirmAttendance"; // página pública de confirmação

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* raiz -> manda para login (ou depois, se quiser, para /dashboard) */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* pública */}
          <Route path="/login" element={<Login />} />

          {/* dashboard do dono */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* criar evento */}
          <Route
            path="/criar-evento"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            }
          />

          {/* detalhes do evento para o dono (quando clica no card) */}
          <Route
            path="/evento/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />

          {/* rota pública para convidados confirmarem presença */}
          <Route path="/confirmar/:id" element={<ConfirmAttendance />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
