'use client';

import { useState } from 'react';
import { Play, Settings, Download, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface QoEMetrics {
  startup_time_ms: number;
  rebuffer_ratio: number;
  error_rate: number;
  fps: number;
  bitrate_kbps: number;
  segments_analyzed: number;
  avg_segment_duration_s: number;
}

interface TestResult {
  test_id: number;
  success: boolean;
  manifest_type: string;
  duration_ms: number;
  qoe_metrics: QoEMetrics;
  session_logs: string[];
  error?: string;
}

export default function PlayerLab() {
  const [manifestUrl, setManifestUrl] = useState('');
  const [drmEnabled, setDrmEnabled] = useState(false);
  const [headers, setHeaders] = useState('{}');
  const [chaos, setChaos] = useState({
    error_rate: 0,
    latency_ms: 0,
    enable_rebuffering: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetManifests = [
    {
      name: 'HLS Demo (Tears of Steel)',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      type: 'HLS'
    },
    {
      name: 'DASH Demo (Big Buck Bunny)',
      url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
      type: 'DASH'
    },
    {
      name: 'HLS Apple Sample',
      url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
      type: 'HLS'
    }
  ];

  const runTest = async () => {
    if (!manifestUrl.trim()) {
      setError('Please enter a manifest URL');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      let parsedHeaders = {};
      if (headers.trim()) {
        parsedHeaders = JSON.parse(headers);
      }

      const response = await fetch('/api/tests/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifest_url: manifestUrl,
          drm_enabled: drmEnabled,
          headers: parsedHeaders,
          chaos
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    if (!result) return;
    
    const exportData = {
      test_id: result.test_id,
      manifest_url: manifestUrl,
      manifest_type: result.manifest_type,
      drm_enabled: drmEnabled,
      test_duration_ms: result.duration_ms,
      qoe_metrics: result.qoe_metrics,
      chaos_config: chaos,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player-test-${result.test_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Datos para gráficos
  const metricsChartData = result ? [
    { name: 'Startup Time', value: result.qoe_metrics.startup_time_ms, unit: 'ms', target: 2000 },
    { name: 'Rebuffer Ratio', value: result.qoe_metrics.rebuffer_ratio * 100, unit: '%', target: 5 },
    { name: 'Error Rate', value: result.qoe_metrics.error_rate, unit: '%', target: 2 },
    { name: 'FPS', value: result.qoe_metrics.fps, unit: 'fps', target: 30 }
  ] : [];

  const bitrateData = result ? [
    { time: '0s', bitrate: result.qoe_metrics.bitrate_kbps * 0.7 },
    { time: '5s', bitrate: result.qoe_metrics.bitrate_kbps * 0.9 },
    { time: '10s', bitrate: result.qoe_metrics.bitrate_kbps },
    { time: '15s', bitrate: result.qoe_metrics.bitrate_kbps * 0.95 },
    { time: '20s', bitrate: result.qoe_metrics.bitrate_kbps }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Player Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pruebas de playback HLS/DASH con métricas QoE y simulación de errores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de configuración */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración
              </h2>

              {/* Manifest URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manifest URL
                </label>
                <input
                  type="url"
                  value={manifestUrl}
                  onChange={(e) => setManifestUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u8"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Presets */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Presets
                </label>
                <div className="space-y-2">
                  {presetManifests.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setManifestUrl(preset.url)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">({preset.type})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DRM Toggle */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={drmEnabled}
                    onChange={(e) => setDrmEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Habilitar DRM simulado
                  </span>
                </label>
              </div>

              {/* Headers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Headers personalizados (JSON)
                </label>
                <textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer token"}'
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>

              {/* Chaos Engineering */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Chaos Engineering
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Error Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={chaos.error_rate}
                      onChange={(e) => setChaos({...chaos, error_rate: Number(e.target.value)})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Latencia adicional (ms)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={chaos.latency_ms}
                      onChange={(e) => setChaos({...chaos, latency_ms: Number(e.target.value)})}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={chaos.enable_rebuffering}
                      onChange={(e) => setChaos({...chaos, enable_rebuffering: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      Simular rebuffering
                    </span>
                  </label>
                </div>
              </div>

              {/* Run Test Button */}
              <button
                onClick={runTest}
                disabled={isRunning}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-200">{error}</span>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Play className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        Test #{result.test_id} completado exitosamente
                      </span>
                    </div>
                    <button
                      onClick={exportResults}
                      className="flex items-center text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    Manifest: {result.manifest_type} • Duración: {result.duration_ms}ms
                  </div>
                </div>

                {/* QoE Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(result.qoe_metrics.startup_time_ms)}ms
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Startup Time</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {(result.qoe_metrics.rebuffer_ratio * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rebuffer Ratio</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {result.qoe_metrics.fps.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">FPS</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(result.qoe_metrics.bitrate_kbps)}k
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Bitrate</div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Metrics Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      QoE Metrics vs Targets
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metricsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value} ${metricsChartData.find(m => m.name === name)?.unit || ''}`,
                            name
                          ]}
                        />
                        <Bar dataKey="value" fill="#3B82F6" />
                        <Bar dataKey="target" fill="#EF4444" opacity={0.3} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Simulated Bitrate Over Time */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Bitrate Simulation
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={bitrateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${Math.round(value)} kbps`, 'Bitrate']} />
                        <Line type="monotone" dataKey="bitrate" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Session Logs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Session Logs
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
                    {result.session_logs.map((log, index) => (
                      <div key={index} className="text-gray-700 dark:text-gray-300 mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Análisis Detallado
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Segmentos analizados:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {result.qoe_metrics.segments_analyzed}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duración promedio:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {result.qoe_metrics.avg_segment_duration_s.toFixed(1)}s
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Error rate:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {result.qoe_metrics.error_rate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!result && !error && !isRunning && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow border border-gray-200 dark:border-gray-700 text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Listo para ejecutar prueba
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure los parámetros y haga clic en "Run Test" para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}