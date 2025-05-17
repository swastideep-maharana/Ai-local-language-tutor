import React, { useState, useRef, useEffect } from "react";

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const formatTimestamp = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const sendMessageToGemini = async (message) => {
    setIsBotThinking(true);
    try {
      const response = await fetch("http://localhost:3000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Unknown error");
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Error: ${errorData.error}`,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply, timestamp: new Date() },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "No response from the tutor.",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setError("Failed to send message.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Failed to send message.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: newMessage.trim(), timestamp: new Date() },
    ]);
    sendMessageToGemini(newMessage.trim());
    setNewMessage("");
  };

  const handleClearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa] p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 px-2 sm:px-4 border-b border-gray-300 pb-3">
        <h1 className="text-2xl font-semibold text-gray-900">
          Odia Tutor Chat
        </h1>
        <button
          onClick={handleClearChat}
          className="text-sm sm:text-base text-red-600 hover:text-red-800 transition px-4 py-2 rounded-lg border border-red-600 hover:border-red-800"
          aria-label="Clear chat"
          title="Clear chat"
          type="button"
        >
          Clear Chat
        </button>
      </header>

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className="flex-grow bg-white rounded-xl p-6 overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex flex-col space-y-5"
        style={{ minHeight: "300px", maxHeight: "70vh" }}
      >
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-10 text-base">
            Start by typing a message below.
          </p>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={i}
              className={`max-w-[75%] p-4 rounded-2xl break-words shadow ${
                isUser
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white self-end rounded-tr-none"
                  : "bg-gray-100 text-gray-900 self-start rounded-tl-none"
              }`}
              style={{ wordBreak: "break-word" }}
            >
              <div className="mb-1 flex items-center justify-between space-x-3 text-xs sm:text-sm font-mono select-none opacity-70">
                <span>{isUser ? "You" : "Tutor"}</span>
                <span>{formatTimestamp(msg.timestamp)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm sm:text-base">
                {msg.text}
              </p>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isBotThinking && (
          <div className="self-start flex items-center space-x-2 text-gray-600 italic text-sm sm:text-base select-none">
            <svg
              className="w-5 h-5 animate-spin text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Tutor is typing...</span>
          </div>
        )}
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-5 py-2 rounded shadow-md z-50 max-w-xs sm:max-w-md text-sm sm:text-base flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-4 font-bold hover:text-red-300 focus:outline-none"
            aria-label="Close error message"
            type="button"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="mt-4 flex items-center bg-white p-3 rounded-xl shadow-md border border-gray-300 max-h-28 sm:max-h-32 space-x-3">
        <textarea
          rows={1}
          className="flex-grow resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 text-base placeholder-gray-400"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          aria-label="Message input"
        />
        <button
          onClick={handleSendMessage}
          disabled={isBotThinking || newMessage.trim() === ""}
          className={`px-5 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition whitespace-nowrap ${
            isBotThinking || newMessage.trim() === ""
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          aria-label="Send message"
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
