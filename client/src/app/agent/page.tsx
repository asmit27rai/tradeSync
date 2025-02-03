"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
  
    try {
      const res = await fetch("http://localhost:5000/api/v1/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
  
      if (!res.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n\n"); // SSE messages are separated by double newlines
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonString = line.slice(6).trim(); // Remove "data: " prefix
  
            if (jsonString === "[DONE]") {
              reader.cancel();
              break;
            }
  
            try {
              const parsed = JSON.parse(jsonString);
              if (parsed.type === "agent" || parsed.type === "tools") {
                result += parsed.content + " "; // Append received chunk
                setResponse(result); // Update UI dynamically
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setResponse("Error fetching response.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Interaction</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="text"
          className="p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter prompt..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700 w-full max-w-md">
          <h2 className="text-lg font-semibold">Response:</h2>
          <p className="mt-2">{response}</p>
        </div>
      )}
    </div>
  );
}
