"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/utils/api";

const API_BASE = getApiBase();

export default function AIPlaygroundPage() {
  const { token } = useAuth();

  const [provider, setProvider] = useState("GEMINI");
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("Explain binary search in one sentence.");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelsError, setModelsError] = useState("");

  const fetchModels = useCallback(async (selectedProvider) => {
    setModelsLoading(true);
    setModelsError("");
    setModels([]);
    setModel("");
    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/models/${selectedProvider}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load models");
      }
      setModels(data.models);
      if (data.models.length > 0) {
        setModel(data.models[0].id);
      }
    } catch (err) {
      setModelsError(err.message);
    } finally {
      setModelsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchModels(provider);
    }
  }, [token, provider, fetchModels]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          provider,
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          maxTokens: 1000
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to generate response");
      }
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AI Gateway Playground</h1>
      <p className="text-gray-500 mb-6">Test your connected AI providers. Models are fetched live from your API key.</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GEMINI">Gemini</option>
              <option value="GROQ">Groq</option>
              <option value="OPENROUTER">OpenRouter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model {modelsLoading && <span className="text-xs text-gray-400">(loading...)</span>}
            </label>
            {modelsError ? (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                {modelsError}
              </div>
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={modelsLoading || models.length === 0}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {models.length === 0 && !modelsLoading && (
                  <option value="">No models available</option>
                )}
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your prompt here..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !model}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
        >
          {loading ? "Generating..." : "Generate Response"}
        </button>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Response</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{response.response}</p>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Token Usage</h3>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Prompt: <strong>{response.usage?.promptTokens}</strong></span>
              <span>Completion: <strong>{response.usage?.completionTokens}</strong></span>
              <span>Total: <strong>{response.usage?.totalTokens}</strong></span>
            </div>
            <details className="mt-4">
              <summary className="text-xs text-gray-400 cursor-pointer">Raw JSON</summary>
              <pre className="text-xs text-gray-700 bg-gray-100 rounded p-3 mt-2 overflow-auto max-h-64">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
