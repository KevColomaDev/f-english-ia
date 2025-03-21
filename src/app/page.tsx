"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Conectar al backend

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Solo acceder a localStorage en el cliente
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("userId", newUserId);
      setUserId(newUserId);
    }

    socket.on("receiveMessage", (data: { user: string; message: string }) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !userId) return;

    setIsLoading(true);

    // Enviar mensaje con userId
    socket.emit("sendMessage", { userId, message });

    setMessages((prev) => [...prev, { user: "You", message }]);
    setMessage('');

    // Escuchar la respuesta de la IA
    socket.on("receiveMessage", (data: { user: string; message: string }) => {
      setMessages((prev) => [...prev, data]);
      setIsLoading(false);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white text-lg font-bold p-4">
        AI Assistant {userId ? `(User: ${userId})` : ""}
      </div>
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center p-2">
            <p className="text-gray-500">Generando respuesta...</p>
          </div>
        )}
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">
            Send a message to start the conversation
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`bg-white text-black p-2 my-2 rounded shadow-md max-w-md ${msg.user === 'You' ? 'ml-auto bg-blue-600 text-black' : 'mr-auto bg-gray-100 text-black'}`}
            >
              <strong className={`${msg.user === 'You' ? 'text-blue-600' : 'text-green-600'}`}>{msg.user}:</strong> {msg.message}
            </div>
          ))
        )}
      </div>
      {/* Input Container */}
      <div className="flex items-center bg-white p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        />
        <button
          onClick={handleSubmit}
          className="ml-2 bg-green-500 text-white p-2 rounded"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
