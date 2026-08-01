"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ALL_PROVIDERS = [
  { id: 'AUTO', name: 'Auto (Best Available)' },
  { id: 'GEMINI', name: 'Gemini' },
  { id: 'GROQ', name: 'Groq' },
  { id: 'OPENROUTER', name: 'OpenRouter' }
];

export default function AIPlaygroundPage() {
  const { token } = useAuth();

  const [provider, setProvider] = useState("AUTO");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("Explain binary search in one sentence.");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modelsError, setModelsError] = useState("");

  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError("");
    try {
      const authToken = token || localStorage.getItem('eduvantix_auth_token');
      const res = await fetch(`${API_BASE}/api/ai/models`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load models");
      }
      setConnectedProviders(data.providers || []);
    } catch (err) {
      setModelsError(err.message);
    } finally {
      setModelsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchModels();
    }
  }, [token, fetchModels]);

  // Derived state for the model dropdown based on selected provider
  let availableModelsForProvider = [];
  let isProviderConnected = true;

  if (provider !== 'AUTO') {
    const providerData = connectedProviders.find(p => p.provider === provider);
    if (providerData) {
      availableModelsForProvider = providerData.models;
    } else {
      isProviderConnected = false;
    }
  }

  // Auto-select first model when switching providers
  useEffect(() => {
    if (provider === 'AUTO') {
      setModel('auto-best');
    } else if (availableModelsForProvider.length > 0) {
      if (!availableModelsForProvider.find(m => m.id === model)) {
        setModel(availableModelsForProvider[0].id);
      }
    } else {
      setModel("");
    }
  }, [provider, availableModelsForProvider, model]);

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
          model: provider === 'AUTO' ? undefined : model,
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

  const selectedModelData = availableModelsForProvider.find(m => m.id === model);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">AI Gateway Playground</h1>
      <p className="text-gray-500 mb-6">Test your connected AI providers using intelligent routing.</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {ALL_PROVIDERS.map(p => {
                const isConnected = p.id === 'AUTO' || connectedProviders.some(cp => cp.provider === p.id);
                return (
                  <option key={p.id} value={p.id} disabled={!isConnected}>
                    {p.name} {!isConnected && '(Not Connected)'}
                  </option>
                );
              })}
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
                disabled={modelsLoading || provider === 'AUTO' || !isProviderConnected || availableModelsForProvider.length === 0}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {provider === 'AUTO' ? (
                  <option value="auto-best">Best Available Model</option>
                ) : !isProviderConnected ? (
                  <option value="">Provider Not Connected</option>
                ) : availableModelsForProvider.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  availableModelsForProvider.map((m) => (
                    <option key={m.id} value={m.id}>{m.displayName}</option>
                  ))
                )}
              </select>
            )}

            {/* Model Capabilities / Metadata */}
            {selectedModelData && selectedModelData.capabilities && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedModelData.capabilities.map((cap, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                    {cap}
                  </span>
                ))}
              </div>
            )}
            {provider === 'AUTO' && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                  Intelligent Routing
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md border border-green-100">
                  Fallback Enabled
                </span>
              </div>
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
          disabled={loading || (provider !== 'AUTO' && !model) || !isProviderConnected}
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
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Resolved:</span>
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200 text-xs font-mono">{response.provider} / {response.model}</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <div className="flex gap-4">
                <span>Prompt: <strong>{response.usage?.promptTokens}</strong></span>
                <span>Completion: <strong>{response.usage?.completionTokens}</strong></span>
                <span>Total: <strong>{response.usage?.totalTokens}</strong></span>
              </div>
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
