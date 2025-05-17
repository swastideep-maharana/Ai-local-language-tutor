import React from "react";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

function App() {
  return (
    <div className="w-full h-screen flex flex-col">
      <h1 className="text-2xl font-bold text-center mt-4">
        Local Language Tutor
      </h1>
      <div className="flex-grow">
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
