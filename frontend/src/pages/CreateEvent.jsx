// src/pages/CreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

// <<< AQUI É O PONTO IMPORTANTE >>>
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://confirmacao-eventos.onrender.com";
// <<< FIM DO AJUSTE >>>

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    maxGuests: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedUser = localStorage.getItem("usuario");
      if (!savedUser) {
        throw new Error("Você precisa estar logado para criar eventos.");
      }
      const usuario = JSON.parse(savedUser);

      const payload = {
        usuarioId: usuario.id,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        maxGuests: Number(formData.maxGuests),
      };

      const res = await fetch(`${API_BASE_URL}/api/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar evento");
      }

      toast({
        title: "Evento criado!",
        description:
          "Seu evento foi criado com sucesso. Compartilhe o link com seus convidados!",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">Criar Novo Evento</h1>
          <p className="text-orange-50 mt-1">
            Preencha os detalhes do seu evento
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Informações do Evento</CardTitle>
            <CardDescription>
              Adicione todos os detalhes para que seus convidados saibam o que
              esperar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="flex items-center gap-2 text-base"
                >
                  <FileText className="w-4 h-4" />
                  Nome do Evento *
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ex: Churrasco de Aniversário"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="flex items-center gap-2 text-base"
                  >
                    <Calendar className="w-4 h-4" />
                    Data *
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="time"
                    className="flex items-center gap-2 text-base"
                  >
                    <Clock className="w-4 h-4" />
                    Horário *
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="flex items-center gap-2 text-base"
                >
                  <MapPin className="w-4 h-4" />
                  Local *
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Ex: Chácara do Zé, Rua das Flores 123"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maxGuests"
                  className="flex items-center gap-2 text-base"
                >
                  <Users className="w-4 h-4" />
                  Limite de Convidados *
                </Label>
                <Input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  min="1"
                  placeholder="Ex: 50"
                  value={formData.maxGuests}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Conte mais sobre o evento..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 h-12"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? "Criando..." : "Criar Evento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
