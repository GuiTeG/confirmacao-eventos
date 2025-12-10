// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { buscarEvento } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Link as LinkIcon,
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await buscarEvento(id);
        setEvento(data);
      } catch (err) {
        console.error("Erro ao carregar evento:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/confirmar/${id}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      alert("Não foi possível copiar o link. Copie manualmente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <p className="text-gray-600">Carregando evento...</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <Card className="shadow-lg">
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <p className="text-gray-700 font-medium">Evento não encontrado</p>
            <Button
              onClick={handleBack}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Número total de confirmados vindo do backend (confirmedCount), com fallback
  const totalConfirmados =
    evento.confirmedCount ??
    evento.confirmados ??
    evento.totalConfirmados ??
    0;

  const linkConfirmacao = `${window.location.origin}/confirmar/${id}`;

  const dataFormatada = evento.date
    ? format(new Date(evento.date), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : "-";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom, #FFF5F0 0%, #FFFFFF 45%, #FFFFFF 100%)",
      }}
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-50/90">Detalhes do evento</p>
            <h1 className="text-3xl font-bold text-white mt-1">
              {evento.title}
            </h1>
          </div>

          <Button
            variant="outline"
            onClick={handleBack}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-6">
        {/* CARD PRINCIPAL */}
        <Card className="shadow-xl border-none">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50/60">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <span className="inline-flex h-8 w-1 rounded-full bg-orange-500" />
              Informações do Evento
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Aqui você acompanha os dados principais e as confirmações de
              presença.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* LINHA: DATA / HORA / LOCAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4 border-b">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide">
                    DATA
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {dataFormatada}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide">
                    HORÁRIO
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {evento.time || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide">
                    LOCAL
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {evento.location || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* LINHA: LIMITE / CONFIRMADOS */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide">
                    LIMITE DE CONVIDADOS
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Limite: {evento.maxGuests} —{" "}
                    <span className="text-orange-600">
                      Confirmados: {totalConfirmados}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIÇÃO */}
            {evento.description && (
              <div className="pt-2 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Descrição
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {evento.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD LINK CONFIRMAÇÃO */}
        <Card className="shadow-md border-none bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Link para confirmação de presença
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 mt-1">
                  Envie esse link para que os convidados confirmem se irão ao
                  evento.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                readOnly
                value={linkConfirmacao}
                className="flex-1 h-11 rounded-md border border-orange-200 bg-white px-3 text-sm text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400"
              />
              <Button
                onClick={handleCopyLink}
                className="h-11 px-5 bg-orange-500 hover:bg-orange-600 text-sm font-semibold shadow-md"
              >
                {copied ? "Copiado!" : "Copiar link"}
              </Button>
            </div>

            <p className="text-xs text-gray-600">
              Você pode colar esse link diretamente no WhatsApp, e-mail ou
              convite digital.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetails;
