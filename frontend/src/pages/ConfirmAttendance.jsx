// src/pages/ConfirmAttendance.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarEvento, confirmarPresenca } from "../lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ConfirmAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [status, setStatus] = useState("confirmado"); // confirmado | nao_vai | talvez
  const [observacao, setObservacao] = useState("");

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await buscarEvento(id);
        setEvento(data);
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
        setEvento(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nome.trim()) {
      setErrorMsg("Informe seu nome para confirmar.");
      return;
    }

    try {
      setSending(true);
      await confirmarPresenca(id, {
        nome: nome.trim(),
        status,
        observacao: observacao.trim() || null,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Erro ao confirmar presença:", err);
      setErrorMsg(err.message || "Erro ao confirmar presença.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0]">
        <div className="text-gray-600">Carregando evento...</div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F0]">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="mb-4 text-gray-700">Evento não encontrado.</p>
          <Button onClick={() => navigate("/login")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const dataFormatada = evento.date
    ? format(new Date(evento.date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : "";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #FFF5F0 0%, #FFFFFF 100%)",
      }}
    >
      {/* Header simples com título do evento */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {evento.title}
            </h1>
            <p className="text-orange-50 mt-1 text-sm">
              Confirme sua presença para ajudar na organização do evento.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Card de informações do evento */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 border border-orange-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Informações do Evento
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            Confira os detalhes e preencha o formulário abaixo para informar se
            você irá participar.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-400">
                  Data
                </div>
                <div className="font-medium">{dataFormatada}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-400">
                  Horário
                </div>
                <div className="font-medium">{evento.time}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-400">
                  Local
                </div>
                <div className="font-medium">{evento.location}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {evento.description}
          </div>
        </div>

        {/* Card de confirmação */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 border border-orange-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Confirme sua presença
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Preencha seu nome e nos diga se você irá ao evento.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-2">
              <CheckCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  Presença registrada com sucesso!
                </p>
                <p className="text-xs mt-1">
                  Obrigado pela confirmação. Caso mude de ideia, fale com o
                  organizador do evento.
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seu nome *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Você irá ao evento?
                </label>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setStatus("confirmado")}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      status === "confirmado"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Sim, vou
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("nao_vai")}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      status === "nao_vai"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Não vou
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("talvez")}
                    className={`px-3 py-1.5 rounded-full border text-sm ${
                      status === "talvez"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Ainda não sei
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
                  placeholder="Alguma informação importante? (ex: vou chegar mais tarde, tenho restrição alimentar...)"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-11 px-6 text-sm font-semibold"
                  disabled={sending}
                >
                  {sending ? "Enviando..." : "Confirmar presença"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmAttendance;
