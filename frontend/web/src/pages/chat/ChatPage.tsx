import { useState } from 'react';
import { PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function ChatPage() {
  const [message, setMessage] = useState('');

  const participants = [
    { id: '1', name: 'Demo Usuario', role: 'Agente', online: true },
    { id: '2', name: 'Carlos Mendoza', role: 'Propietario', online: true },
    { id: '3', name: 'María García', role: 'Comprador', online: false },
    { id: '4', name: 'Sistema RealSync', role: 'Bot', online: true },
  ];

  const messages = [
    {
      id: '1',
      sender: 'Sistema RealSync',
      senderId: '4',
      message: 'Bienvenidos al chat de la transacción Av. Conquistadores 456',
      time: '2024-01-15 09:30',
      isSystem: true,
    },
    {
      id: '2',
      sender: 'Carlos Mendoza',
      senderId: '2',
      message: 'Buenos días, estoy listo para comenzar el proceso de venta',
      time: '2024-01-15 10:15',
      isSystem: false,
    },
    {
      id: '3',
      sender: 'Demo Usuario',
      senderId: '1',
      message: 'Excelente Carlos! Ya tenemos la propiedad publicada y he recibido varias consultas.',
      time: '2024-01-15 10:20',
      isSystem: false,
    },
    {
      id: '4',
      sender: 'María García',
      senderId: '3',
      message: 'Hola, estoy muy interesada en la propiedad. ¿Podríamos agendar una visita?',
      time: '2024-01-16 14:30',
      isSystem: false,
    },
    {
      id: '5',
      sender: 'Demo Usuario',
      senderId: '1',
      message: 'Por supuesto María! ¿Te viene bien el jueves 18 a las 4:00 PM?',
      time: '2024-01-16 14:45',
      isSystem: false,
    },
    {
      id: '6',
      sender: 'María García',
      senderId: '3',
      message: 'Perfecto, nos vemos entonces!',
      time: '2024-01-16 15:00',
      isSystem: false,
    },
    {
      id: '7',
      sender: 'Sistema RealSync',
      senderId: '4',
      message: '📅 Visita programada para el 18/01/2024 a las 4:00 PM',
      time: '2024-01-16 15:01',
      isSystem: true,
    },
    {
      id: '8',
      sender: 'María García',
      senderId: '3',
      message: 'La visita fue excelente. Me gustaría hacer una oferta de S/ 430,000',
      time: '2024-01-20 16:45',
      isSystem: false,
    },
    {
      id: '9',
      sender: 'Carlos Mendoza',
      senderId: '2',
      message: 'Gracias por la oferta. Estamos considerando S/ 445,000',
      time: '2024-01-21 10:30',
      isSystem: false,
    },
    {
      id: '10',
      sender: 'María García',
      senderId: '3',
      message: 'Entiendo. ¿Podrían aceptar S/ 445,000? Me parece un precio justo.',
      time: '2024-01-22 09:15',
      isSystem: false,
    },
    {
      id: '11',
      sender: 'Carlos Mendoza',
      senderId: '2',
      message: '¡Aceptado! Procedamos con el siguiente paso.',
      time: '2024-01-22 15:20',
      isSystem: false,
    },
    {
      id: '12',
      sender: 'Sistema RealSync',
      senderId: '4',
      message: '🎉 ¡Oferta aceptada! Precio acordado: S/ 445,000',
      time: '2024-01-22 15:21',
      isSystem: true,
    },
    {
      id: '13',
      sender: 'Demo Usuario',
      senderId: '1',
      message: 'Felicidades a ambos! Ahora coordinaremos la inspección técnica y los documentos finales.',
      time: '2024-01-22 16:00',
      isSystem: false,
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement message sending when backend is ready
    console.log('Message sent:', message);
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat de Transacción</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comunicación en tiempo real - Av. Conquistadores 456
        </p>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {/* Participants Sidebar */}
        <div className="col-span-1 bg-white shadow rounded-lg p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Participantes</h2>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-3">
                <div className="relative">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  {participant.online && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.name}
                  </p>
                  <p className="text-xs text-gray-500">{participant.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase">Info Rápida</h3>
            <div className="mt-3 space-y-2 text-xs text-gray-600">
              <p><span className="font-medium">Propiedad:</span> San Isidro</p>
              <p><span className="font-medium">Precio:</span> S/ 445,000</p>
              <p><span className="font-medium">Estado:</span> En proceso</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-3 bg-white shadow rounded-lg flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === '1' ? 'justify-end' : 'justify-start'} ${
                  msg.isSystem ? 'justify-center' : ''
                }`}
              >
                {msg.isSystem ? (
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-xs text-center max-w-md">
                    {msg.message}
                  </div>
                ) : (
                  <div
                    className={`max-w-md ${
                      msg.senderId === '1' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                    } rounded-lg px-4 py-3`}
                  >
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className={`text-xs font-medium ${msg.senderId === '1' ? 'text-primary-100' : 'text-gray-600'}`}>
                        {msg.sender}
                      </span>
                      <span className={`text-xs ${msg.senderId === '1' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              Demo: Los mensajes no se enviarán hasta que el backend esté conectado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
