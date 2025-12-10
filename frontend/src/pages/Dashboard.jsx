// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  LogOut,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { listarEventos, deletarEvento } from "../lib/utils";
import { useToast } from "../hooks/use-toast";

// Base da API (mesmo padrão do AuthContext / CreateEvent)
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://confirmacao-eventos.onrender.com";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Estados para confirmações
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [confirmations, setConfirmations] = useState([]);
  const [loadingConfirmations, setLoadingConfirmations] = useState(false);
  const [errorConfirmations, setErrorConfirmations] = useState("");

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await listarEventos(user?.id);
      setEvents(data);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus eventos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getTotalConfirmations = (event) => {
    // backend devolve "confirmedCount"
    return event.confirmedCount ?? 0;
  };

  const handleDelete = async (e, eventId) => {
    e.stopPropagation();

    if (!window.confirm("Tem certeza que deseja excluir este evento?")) {
      return;
    }

    try {
      setDeletingId(eventId);
      await deletarEvento(eventId, user.id);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));

      toast({
        title: "Evento excluído",
        description: "O evento foi removido com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao deletar evento:", err);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e, eventId) => {
    e.stopPropagation();
    toast({
      title: "Em breve",
      description: "Tela de edição ainda vamos montar 😄",
    });
  };

  // Carregar confirmações de um evento (somente do dono)
  const handleViewConfirmations = async (event) => {
    if (!user?.id) return;

    // Se clicar de novo no mesmo card, esconde
    if (selectedEventId === event.id) {
      setSelectedEventId(null);
      setConfirmations([]);
      setErrorConfirmations("");
      return;
    }

    try {
      setSelectedEventId(event.id);
      setLoadingConfirmations(true);
      setErrorConfirmations("");
      setConfirmations([]);

      const res = await fetch(
        `${API_BASE_URL}/api/eventos/${event.id}/confirmacoes?usuarioId=${user.id}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar confirmações");
      }

      setConfirmations(data.confirmacoes || []);
    } catch (err) {
      console.error("Erro ao carregar confirmações:", err);
      setErrorConfirmations(
        err.message || "Não foi possível carregar as confirmações."
      );
    } finally {
      setLoadingConfirmations(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #FFF5F0 0%, #FFFFFF 100%)",
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Meus Eventos</h1>
              <p className="text-orange-50 mt-1">
                Olá, {user?.nome || user?.name}!
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Seus Eventos</h2>
            <p className="text-gray-600 mt-1">
              {events.length} evento(s) criado(s)
            </p>
          </div>
          <Button
            onClick={() => navigate("/criar-evento")}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Evento
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum evento criado
              </h3>
              <p className="text-gray-500 mb-6">
                Comece criando seu primeiro evento!
              </p>
              <Button
                onClick={() => navigate("/criar-evento")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500 group"
              >
                <CardHeader className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-200">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </div>

                  {/* Ações: editar / excluir */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-orange-200 text-orange-600 hover:bg-orange-50"
                      onClick={(e) => handleEdit(e, event.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, event.id)}
                      disabled={deletingId === event.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                    {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center text-sm font-semibold text-orange-600">
                      <Users className="w-4 h-4 mr-2" />
                      {getTotalConfirmations(event)} confirmado(s)
                    </div>
                    <div className="text-sm text-gray-500">
                      Limite: {event.maxGuests}
                    </div>
                  </div>

                  {/* Botão para ver confirmações */}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewConfirmations(event)}
                    >
                      {selectedEventId === event.id
                        ? "Esconder confirmações"
                        : "Ver confirmações"}
                    </Button>
                  </div>

                  {/* Lista de confirmações do evento selecionado */}
                  {selectedEventId === event.id && (
                    <div className="mt-3 space-y-2">
                      {loadingConfirmations && (
                        <p className="text-sm text-gray-500">
                          Carregando confirmações...
                        </p>
                      )}

                      {errorConfirmations && (
                        <p className="text-sm text-red-500">
                          {errorConfirmations}
                        </p>
                      )}

                      {!loadingConfirmations &&
                        !errorConfirmations &&
                        confirmations.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Ainda não há confirmações para este evento.
                          </p>
                        )}

                      {!loadingConfirmations &&
                        confirmations.map((c) => (
                          <div
                            key={c.id}
                            className="text-sm border rounded-md p-2 bg-muted/40"
                          >
                            <p>
                              <strong>{c.nome}</strong>{" "}
                              {c.telefone && (
                                <span className="text-xs text-gray-500">
                                  · {c.telefone}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Status: {c.status || "confirmado"}
                            </p>
                            {c.observacao && (
                              <p className="text-xs mt-1">{c.observacao}</p>
                            )}
                            {c.created_at && (
                              <p className="text-[11px] text-gray-400 mt-1">
                                {new Date(c.created_at).toLocaleString("pt-BR")}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
