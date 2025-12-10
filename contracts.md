# API Contracts & Backend Integration Plan

## 1. DADOS MOCKADOS (mock.js) - Para Substituir

### Autenticação
- `mockLogin()` - Login com email/senha
- `mockRegister()` - Registro de novo usuário
- `mockUser` - Dados do usuário logado

### Eventos
- `mockEvents` - Lista de eventos do usuário
- `mockGetUserEvents()` - Buscar eventos do usuário
- `mockCreateEvent()` - Criar novo evento
- `mockGetEvent()` - Buscar evento específico por ID

### Confirmações
- `mockConfirmAttendance()` - Confirmar presença em evento

## 2. API ENDPOINTS (Backend)

### Autenticação
```
POST /api/auth/register
Body: { name, email, password }
Response: { user: {...}, token: "jwt-token" }

POST /api/auth/login
Body: { email, password }
Response: { user: {...}, token: "jwt-token" }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: {...} }
```

### Eventos (Protected)
```
GET /api/events
Headers: Authorization: Bearer <token>
Response: [{ id, title, date, time, location, description, maxGuests, organizerId, confirmations: [...] }]

POST /api/events
Headers: Authorization: Bearer <token>
Body: { title, date, time, location, description, maxGuests }
Response: { id, title, date, time, location, description, maxGuests, organizerId, createdAt, confirmations: [] }

GET /api/events/:id
Headers: Authorization: Bearer <token>
Response: { id, title, date, time, location, description, maxGuests, organizerId, confirmations: [...] }
```

### Confirmações (Public)
```
GET /api/confirmations/:eventId
Response: { event: {...}, confirmations: [...] }

POST /api/confirmations/:eventId
Body: { guestName, companions, notes }
Response: { id, guestName, companions, notes, confirmedAt }
```

## 3. MONGODB MODELS

### User
```python
{
  _id: ObjectId,
  name: str,
  email: str (unique),
  password_hash: str,
  created_at: datetime
}
```

### Event
```python
{
  _id: ObjectId,
  title: str,
  date: str (ISO format),
  time: str,
  location: str,
  description: str,
  max_guests: int,
  organizer_id: str (User ID),
  created_at: datetime
}
```

### Confirmation
```python
{
  _id: ObjectId,
  event_id: str (Event ID),
  guest_name: str,
  companions: int,
  notes: str,
  confirmed_at: datetime
}
```

## 4. BACKEND IMPLEMENTATION

### Necessário implementar:
1. **Auth System**
   - Password hashing (bcrypt)
   - JWT token generation and validation
   - Protected route decorator

2. **Event Endpoints**
   - CRUD operations for events
   - Filter events by organizer
   - Include confirmations count

3. **Confirmation Endpoints**
   - Public endpoint to get event details
   - Create confirmation with validation (max guests)
   - List confirmations by event

4. **Validation**
   - Check max guests limit before confirming
   - Validate required fields
   - Check event ownership for protected operations

## 5. FRONTEND INTEGRATION

### Arquivos a modificar:

#### 1. `/app/frontend/src/context/AuthContext.jsx`
- Substituir `mockLogin` por chamada real à API `/api/auth/login`
- Substituir `mockRegister` por chamada real à API `/api/auth/register`
- Adicionar interceptor axios para incluir token em requests

#### 2. `/app/frontend/src/pages/Dashboard.jsx`
- Substituir `mockGetUserEvents()` por `axios.get('/api/events')`
- Adicionar header Authorization com token

#### 3. `/app/frontend/src/pages/CreateEvent.jsx`
- Substituir `mockCreateEvent()` por `axios.post('/api/events', eventData)`
- Adicionar header Authorization com token

#### 4. `/app/frontend/src/pages/EventDetails.jsx`
- Substituir `mockGetEvent()` por `axios.get(`/api/events/${id}`)`
- Adicionar header Authorization com token

#### 5. `/app/frontend/src/pages/ConfirmAttendance.jsx`
- Substituir `mockGetEvent()` por `axios.get(`/api/confirmations/${id}`)`
- Substituir `mockConfirmAttendance()` por `axios.post(`/api/confirmations/${id}`, data)`

### API Service Helper (Criar)
```javascript
// /app/frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 6. INTEGRATION STEPS

1. Implementar backend com todos os endpoints
2. Criar arquivo `/app/frontend/src/services/api.js` 
3. Modificar AuthContext para usar API real
4. Modificar todas as páginas para usar API real (substituir mock calls)
5. Remover arquivo mock.js (opcional, manter para referência)
6. Testar fluxo completo: registro → login → criar evento → confirmar presença

## 7. ERROR HANDLING

Backend deve retornar:
- 200/201 para sucesso
- 400 para validação falhou
- 401 para não autenticado
- 404 para não encontrado
- 500 para erro de servidor

Frontend deve tratar erros e exibir mensagens apropriadas usando toast.
