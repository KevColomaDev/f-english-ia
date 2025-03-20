"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Conectar al backend

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ user: string; message: string }[]>(
    []
  );

  useEffect(() => {
    // Escuchar mensajes del servidor
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    // Enviar mensaje al servidor
    socket.emit("sendMessage", { message });

    setMessages((prev) => [...prev, { user: "You", message }]);
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-3 p-3 items-center">
      <h1 className="text-2xl font-bold">Demo Chat</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="message" className="block">Write your phrase</label>
        <input
          type="text"
          id="message"
          name="message"
          className="block w-full p-2 border border-gray-300 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="block bg-blue-500 text-white p-2 rounded">
          Send
        </button>
      </form>

      <div className="flex flex-col gap-3 w-full items-center">
        <h2 className="text-2xl font-bold">Chat</h2>
        <div className="block w-full p-2 border border-gray-300 rounded">
          {messages.map((msg, index) => (
            <p key={index}>
              <strong>{msg.user}:</strong> {msg.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
