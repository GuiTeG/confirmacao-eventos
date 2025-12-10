// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

// ============ HEALTH =============
app.get("/", (req, res) => {
  res.send("API Evento Tracker rodando 🚀");
});

// ============ USUÁRIOS ============

// POST /api/usuarios  -> cadastro
app.post("/api/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Nome, email e senha são obrigatórios" });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const [usuario] = await sql`
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES (${nome}, ${email}, ${senhaHash})
      RETURNING id, nome, email, created_at
    `;

    console.log("Usuário criado:", usuario);

    return res.status(201).json({ usuario });
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);

    if (err.code === "23505") {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    return res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
});

// ============ LOGIN ===============

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const rows = await sql`
      SELECT id, nome, email, senha_hash
      FROM usuarios
      WHERE email = ${email}
      LIMIT 1
    `;

    const usuario = rows[0];

    if (!usuario) {
      console.log("Login falhou: usuário não encontrado para", email);
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaConfere) {
      console.log("Login falhou: senha incorreta para", email);
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const { senha_hash, ...usuarioSemSenha } = usuario;

    console.log("Login OK para", email);

    return res.json({
      message: "Login bem-sucedido",
      usuario: usuarioSemSenha,
    });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// ============ EVENTOS ============
//
// Tabela eventos:
//
// CREATE TABLE eventos (
//   id              serial primary key,
//   usuario_id      integer references usuarios(id),
//   titulo          text,
//   descricao       text,
//   data_evento     date,
//   hora_evento     text,
//   local_evento    text,
//   max_convidados  integer,
//   created_at      timestamptz default now()
// );

// GET /api/eventos?usuarioId=1  -> lista eventos do usuário + confirmedCount
// GET /api/eventos              -> lista todos (pra teste)
app.get("/api/eventos", async (req, res) => {
  try {
    const { usuarioId } = req.query;

    let eventos;
    if (usuarioId) {
      eventos = await sql`
        SELECT
          e.id,
          e.usuario_id,
          e.titulo         AS "title",
          e.descricao      AS "description",
          e.data_evento    AS "date",
          e.hora_evento    AS "time",
          e.local_evento   AS "location",
          e.max_convidados AS "maxGuests",
          e.created_at,
          COALESCE((
            SELECT COUNT(*)
            FROM confirmacoes c
            WHERE c.origem = 'evento-' || e.id
              AND c.status = 'confirmado'
          ), 0) AS "confirmedCount"
        FROM eventos e
        WHERE e.usuario_id = ${usuarioId}
        ORDER BY e.created_at DESC
      `;
    } else {
      eventos = await sql`
        SELECT
          e.id,
          e.usuario_id,
          e.titulo         AS "title",
          e.descricao      AS "description",
          e.data_evento    AS "date",
          e.hora_evento    AS "time",
          e.local_evento   AS "location",
          e.max_convidados AS "maxGuests",
          e.created_at,
          COALESCE((
            SELECT COUNT(*)
            FROM confirmacoes c
            WHERE c.origem = 'evento-' || e.id
              AND c.status = 'confirmado'
          ), 0) AS "confirmedCount"
        FROM eventos e
        ORDER BY e.created_at DESC
      `;
    }

    res.json(eventos);
  } catch (err) {
    console.error("Erro ao listar eventos:", err);
    res.status(500).json({ error: "Erro ao listar eventos" });
  }
});

// POST /api/eventos -> cria evento
app.post("/api/eventos", async (req, res) => {
  try {
    const {
      usuarioId,
      title,
      description,
      date,
      time,
      location,
      maxGuests,
    } = req.body;

    if (!usuarioId || !title || !date || !time || !location || !maxGuests) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios faltando" });
    }

    const [evento] = await sql`
      INSERT INTO eventos (
        usuario_id,
        titulo,
        descricao,
        data_evento,
        hora_evento,
        local_evento,
        max_convidados
      )
      VALUES (
        ${usuarioId},
        ${title},
        ${description || null},
        ${date},
        ${time},
        ${location},
        ${maxGuests}
      )
      RETURNING
        id,
        usuario_id,
        titulo         AS "title",
        descricao      AS "description",
        data_evento    AS "date",
        hora_evento    AS "time",
        local_evento   AS "location",
        max_convidados AS "maxGuests",
        created_at
    `;

    console.log("Evento criado:", evento);
    res.status(201).json({ evento });
  } catch (err) {
    console.error("Erro ao criar evento:", err);
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// GET /api/eventos/:id -> detalhe (inclui confirmedCount)
app.get("/api/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await sql`
      SELECT
        e.id,
        e.usuario_id,
        e.titulo         AS "title",
        e.descricao      AS "description",
        e.data_evento    AS "date",
        e.hora_evento    AS "time",
        e.local_evento   AS "location",
        e.max_convidados AS "maxGuests",
        e.created_at,
        COALESCE((
          SELECT COUNT(*)
          FROM confirmacoes c
          WHERE c.origem = 'evento-' || e.id
            AND c.status = 'confirmado'
        ), 0) AS "confirmedCount"
      FROM eventos e
      WHERE e.id = ${id}
      LIMIT 1
    `;

    const evento = rows[0];

    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    res.json({ evento });
  } catch (err) {
    console.error("Erro ao buscar evento:", err);
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
});

// PUT /api/eventos/:id -> atualizar (só dono)
app.put("/api/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      usuarioId,
      title,
      description,
      date,
      time,
      location,
      maxGuests,
    } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: "usuarioId é obrigatório" });
    }

    const [evento] = await sql`
      UPDATE eventos
      SET
        titulo         = COALESCE(${title},       titulo),
        descricao      = COALESCE(${description}, descricao),
        data_evento    = COALESCE(${date},        data_evento),
        hora_evento    = COALESCE(${time},        hora_evento),
        local_evento   = COALESCE(${location},    local_evento),
        max_convidados = COALESCE(${maxGuests},   max_convidados)
      WHERE id = ${id}
        AND usuario_id = ${usuarioId}
      RETURNING
        id,
        usuario_id,
        titulo         AS "title",
        descricao      AS "description",
        data_evento    AS "date",
        hora_evento    AS "time",
        local_evento   AS "location",
        max_convidados AS "maxGuests",
        created_at
    `;

    if (!evento) {
      return res.status(404).json({
        error: "Evento não encontrado ou não pertence ao usuário",
      });
    }

    res.json({ evento });
  } catch (err) {
    console.error("Erro ao atualizar evento:", err);
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// DELETE /api/eventos/:id -> excluir (só dono)
app.delete("/api/eventos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;

    if (!usuarioId) {
      return res.status(400).json({ error: "usuarioId é obrigatório" });
    }

    const result = await sql`
      DELETE FROM eventos
      WHERE id = ${id}
        AND usuario_id = ${usuarioId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({
        error: "Evento não encontrado ou não pertence ao usuário",
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir evento:", err);
    res.status(500).json({ error: "Erro ao excluir evento" });
  }
});

// ============ CONFIRMAÇÕES ============
//
// Tabela confirmacoes (já existente):
//
//  id serial primary key,
//  nome text,
//  email text,
//  telefone text,
//  status text,
//  origem text,
//  observacao text,
//  created_at timestamptz default now()

// POST /api/eventos/:id/confirmacoes -> convidado confirma presença
app.post("/api/eventos/:id/confirmacoes", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, status, observacao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const statusFinal = status || "confirmado";
    const origem = `evento-${id}`;

    const [confirmacao] = await sql`
      INSERT INTO confirmacoes (nome, email, telefone, status, origem, observacao)
      VALUES (
        ${nome},
        ${null},
        ${null},
        ${statusFinal},
        ${origem},
        ${observacao || null}
      )
      RETURNING
        id,
        nome,
        email,
        telefone,
        status,
        origem,
        observacao,
        created_at
    `;

    console.log("Confirmação criada para evento:", id, confirmacao);

    res.status(201).json({ confirmacao });
  } catch (err) {
    console.error("Erro ao registrar confirmação:", err);
    res.status(500).json({ error: "Erro ao registrar confirmação" });
  }
});

// ============ START SERVER ============
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});

// GET /api/eventos/:id/confirmacoes?usuarioId=1
// Lista quem confirmou presença naquele evento (só o dono pode ver)
app.get("/api/eventos/:id/confirmacoes", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;

    if (!usuarioId) {
      return res
        .status(400)
        .json({ error: "usuarioId é obrigatório na query string" });
    }

    // Confere se esse evento é do usuário
    const donoRows = await sql`
      SELECT usuario_id
      FROM eventos
      WHERE id = ${id}
      LIMIT 1
    `;

    const dono = donoRows[0];

    if (!dono) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    if (dono.usuario_id !== Number(usuarioId)) {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para ver este evento" });
    }

    // Busca confirmações vinculadas a esse evento
    const confirmacoes = await sql`
      SELECT
        id,
        nome,
        email,
        telefone,
        status,
        observacao,
        created_at
      FROM confirmacoes
      WHERE origem = ${"evento-" + id}
      ORDER BY created_at DESC
    `;

    return res.json({ confirmacoes });
  } catch (err) {
    console.error("Erro ao listar confirmações:", err);
    return res
      .status(500)
      .json({ error: "Erro ao listar confirmações do evento" });
  }
});
