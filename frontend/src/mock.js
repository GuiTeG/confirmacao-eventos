// Mock data para desenvolvimento frontend

export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com'
};

export const mockEvents = [
  {
    id: '1',
    title: 'Churrasco de Aniversário',
    date: '2025-08-15',
    time: '18:00',
    location: 'Chácara do Zé',
    description: 'Vamos comemorar meu aniversário com um churras! Traga seu apetite!',
    maxGuests: 50,
    organizerId: '1',
    createdAt: '2025-07-10T10:00:00Z',
    confirmations: [
      {
        id: '1',
        guestName: 'Maria Santos',
        companions: 2,
        notes: 'Vou levar salada!',
        confirmedAt: '2025-07-11T14:30:00Z'
      },
      {
        id: '2',
        guestName: 'Pedro Costa',
        companions: 0,
        notes: '',
        confirmedAt: '2025-07-12T09:15:00Z'
      },
      {
        id: '3',
        guestName: 'Ana Oliveira',
        companions: 1,
        notes: 'Posso levar bebidas?',
        confirmedAt: '2025-07-13T16:45:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Festa de Réveillon',
    date: '2025-12-31',
    time: '22:00',
    location: 'Sítio da Família',
    description: 'Vamos celebrar a virada do ano juntos! Piscina, música e muita diversão!',
    maxGuests: 100,
    organizerId: '1',
    createdAt: '2025-07-08T15:20:00Z',
    confirmations: []
  }
];

// Simula login
export const mockLogin = (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email && password) {
        const token = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ success: true, user: mockUser, token });
      } else {
        resolve({ success: false, message: 'Email e senha são obrigatórios' });
      }
    }, 500);
  });
};

// Simula registro
export const mockRegister = (name, email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (name && email && password) {
        const newUser = { ...mockUser, name, email };
        const token = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve({ success: true, user: newUser, token });
      } else {
        resolve({ success: false, message: 'Todos os campos são obrigatórios' });
      }
    }, 500);
  });
};

// Simula buscar eventos do usuário
export const mockGetUserEvents = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEvents);
    }, 300);
  });
};

// Simula criar evento
export const mockCreateEvent = (eventData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        organizerId: mockUser.id,
        createdAt: new Date().toISOString(),
        confirmations: []
      };
      resolve(newEvent);
    }, 500);
  });
};

// Simula buscar evento específico
export const mockGetEvent = (eventId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockEvents.find(e => e.id === eventId);
      resolve(event || null);
    }, 300);
  });
};

// Simula confirmar presença
export const mockConfirmAttendance = (eventId, confirmationData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const confirmation = {
        ...confirmationData,
        id: Date.now().toString(),
        confirmedAt: new Date().toISOString()
      };
      resolve(confirmation);
    }, 500);
  });
};
