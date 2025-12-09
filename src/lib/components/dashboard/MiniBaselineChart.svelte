<script lang="ts">
  /**
   * MiniBaselineChart
   * 
   * Zeigt die User-Baseline als:
   * - SVG-Chart (Kurve mit Datenpunkten + aktueller Stunden-Marker)
   * - Fallback: Tabelle mit Stunden-Werten (bei Render-Fehler)
   * 
   * Features:
   * - Globale Baseline als gestrichelte Linie
   * - User-Baseline als durchgezogene Linie
   * - Datenpunkte mit Indicator ob User-Daten vorhanden
   * - Aktueller Zeitpunkt als vertikale Linie
   */
  
  import type { BaselinePoint, TodayTestDeviation } from '$lib/types/forecast';
  import { onMount } from 'svelte';
  
  interface Props {
    userBaseline: BaselinePoint[];
    currentHour?: number;
    todayTests?: TodayTestDeviation[];
  }
  
  let { 
    userBaseline, 
    currentHour = new Date().getHours(), 
    todayTests = [] 
  }: Props = $props();
  
  let chartError = $state(false);
  let chartContainer: HTMLDivElement;
  
  // Mobile Detection (reactive)
  let isMobile = $state(false);
  
  onMount(() => {
    // Initial check
    isMobile = window.innerWidth < 768;
    
    // Update on resize
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
    };
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  });
  
  // Chart Dimensions (mobile-optimiert)
  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 35, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Skalen
  const xScale = (hour: number) => (hour / 23) * chartWidth;
  const yScale = (value: number) => chartHeight - (value / 100) * chartHeight;
  
  // SVG Pfad generieren (für glatte Kurven mit Catmull-Rom Splines)
  function generateSmoothPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    
    // Monotone Cubic Interpolation (vereinfacht für glatte Kurven)
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Berechne Kontrollpunkte für Bezier-Kurve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y + (next.y - current.y) / 3;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = current.y + 2 * (next.y - current.y) / 3;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    
    return path;
  }
  
  // Globale Baseline Pfad (glatte graue Linie)
  let globalPath = $derived(generateSmoothPath(
    userBaseline.map((p) => ({
      x: xScale(p.hour),
      y: yScale(p.globalValue),
    }))
  ));
  
  // User Baseline Pfad (glatte lila Linie - ALLE 24 Stunden)
  let userPath = $derived(generateSmoothPath(
    userBaseline.map((p) => ({
      x: xScale(p.hour),
      y: yScale(p.userValue ?? p.globalValue),
    }))
  ));
  
  // Aktueller Zeitpunkt (vertikale Linie)
  let currentX = $derived(xScale(currentHour));
  
  // X-Achse Labels (mobile-optimiert: weniger Labels)
  let xLabels = $derived([0, 6, 12, 18].map((hour) => ({
    hour,
    x: xScale(hour),
    label: `${hour}h`,
  })));
  
  // Y-Achse Labels (0, 50, 100)
  let yLabels = $derived([0, 50, 100].map((value) => ({
    value,
    y: yScale(value),
  })));
  
  onMount(() => {
    // Error Handling: Falls SVG nicht rendert
    try {
      if (!chartContainer) {
        chartError = true;
      }
    } catch (err) {
      console.error('[MiniBaselineChart] Render-Fehler:', err);
      chartError = true;
    }
  });
</script>

<div class="card-modern" bind:this={chartContainer}>
  <div class="card-body">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-gray-900 mb-2">
        So verläuft dein Tag typischerweise
      </h3>
      <p class="text-sm text-gray-600">
        <span class="font-medium text-purple-600">Lila</span>: deine persönliche Linie · 
        <span class="font-medium text-gray-400">Grau</span>: allgemeine Norm · 
        <span class="font-medium text-orange-500">Orange</span>: jetzt
      </p>
    </div>
    
    {#if !chartError}
      <!-- SVG Chart (responsive, mobile: keine horizontale Scroll, ganzer Tag sichtbar) -->
      <div class="chart-wrapper">
        <svg 
          {width} 
          {height} 
          viewBox="0 0 {width} {height}" 
          class="w-full h-auto"
          class:mobile-chart={isMobile}
        >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            <!-- Y-Achse Grid Lines -->
            {#each yLabels as { value, y }}
              <line
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="currentColor"
                stroke-opacity="0.1"
                stroke-width="1"
              />
            {/each}
            
            <!-- Globale Baseline (gestrichelte graue Linie - OHNE Punkte) -->
            <path
              d={globalPath}
              fill="none"
              stroke="#9ca3af"
              stroke-opacity="0.5"
              stroke-width="2"
              stroke-dasharray="6 4"
              stroke-linecap="round"
            />
            
            <!-- User Baseline (durchgezogene lila Linie - OHNE Punkte) -->
            <path
              d={userPath}
              fill="none"
              stroke="#9333ea"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="drop-shadow-sm"
            />
            
            <!-- Aktueller Zeitpunkt (vertikale Linie + Marker oben) -->
            <line
              x1={currentX}
              y1="0"
              x2={currentX}
              y2={chartHeight}
              stroke="#f97316"
              stroke-width="2.5"
              stroke-dasharray="4 2"
              opacity="0.7"
            />
            <circle
              cx={currentX}
              cy="0"
              r="6"
              fill="#f97316"
              stroke="white"
              stroke-width="2"
              class="drop-shadow-lg"
            >
              <title>Jetzt ({currentHour}:00)</title>
            </circle>
            
            <!-- Heutige Tests als Marker (Desktop: alle, Mobile: versteckt - werden als Liste gezeigt) -->
            {#if !isMobile}
              {#each todayTests as test}
                {@const x = xScale(test.hour)}
                {@const y = yScale(test.score)}
                {@const isAbove = test.delta > 0}
                {@const isBelow = test.delta < 0}
                {@const color = isAbove ? '#22c55e' : isBelow ? '#ef4444' : '#6b7280'}
                
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill={color}
                  stroke="white"
                  stroke-width="2.5"
                  class="drop-shadow-lg"
                >
                  <title>
                    Heute {test.hour}:00 - Score: {Math.round(test.score)}
                    {#if test.delta > 0}
                      (+{Math.round(test.delta)} über deiner Linie)
                    {:else if test.delta < 0}
                      ({Math.round(test.delta)} unter deiner Linie)
                    {:else}
                      (auf deiner Linie)
                    {/if}
                  </title>
                </circle>
              {/each}
            {/if}
            
            <!-- X-Achse Labels -->
            {#each xLabels as { x, label }}
              <text
                x={x}
                y={chartHeight + 25}
                text-anchor="middle"
                font-size="12"
                fill="currentColor"
                opacity="0.6"
              >
                {label}
              </text>
            {/each}
            
            <!-- Y-Achse Labels -->
            {#each yLabels as { value, y }}
              <text
                x="-10"
                y={y + 4}
                text-anchor="end"
                font-size="12"
                fill="currentColor"
                opacity="0.6"
              >
                {value}
              </text>
            {/each}
          </g>
        </svg>
      </div>
      
      <!-- Legende (Mobile: vereinfacht auf 3 Einträge, Desktop: alle anzeigen) -->
      <div class="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 text-xs text-gray-600 border-t border-gray-200 pt-4">
        <div class="flex items-center gap-2">
          <div class="w-5 h-0.5 border-t-2 border-dashed border-gray-400"></div>
          <span>Norm</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-5 h-0.5 bg-purple-600"></div>
          <span>Deine Linie</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Jetzt</span>
        </div>
        {#if todayTests.length > 0 && !isMobile}
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Tests über Linie</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Tests unter Linie</span>
          </div>
        {/if}
      </div>
      
      <!-- Mobile: Test-Liste unterhalb des Charts (ersetzt die Punkte im Chart) -->
      {#if isMobile && todayTests.length > 0}
        <div class="mt-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-base">schedule</span>
            Deine heutigen Fokus-Checks
          </h4>
          <div class="space-y-2">
            {#each todayTests as test}
              {@const isAbove = test.delta > 0}
              {@const isBelow = test.delta < 0}
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-600 font-medium">{test.hour}:00 Uhr</span>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-900">{Math.round(test.score)}</span>
                  {#if isAbove}
                    <span class="text-green-600 text-[10px] bg-green-50 px-2 py-0.5 rounded-full">
                      ▲ {Math.round(test.delta)} über Linie
                    </span>
                  {:else if isBelow}
                    <span class="text-red-600 text-[10px] bg-red-50 px-2 py-0.5 rounded-full">
                      ▼ {Math.abs(Math.round(test.delta))} unter Linie
                    </span>
                  {:else}
                    <span class="text-gray-500 text-[10px]">auf Linie</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {:else}
      <!-- Fallback: Tabelle -->
      <div class="alert alert-warning mb-4">
        <span class="material-symbols-outlined">warning</span>
        <span>Chart konnte nicht geladen werden. Hier sind die Werte als Tabelle:</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Stunde</th>
              <th>Global</th>
              <th>Deine Baseline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each userBaseline as point}
              <tr class:font-bold={point.hour === currentHour}>
                <td>
                  {point.hour}:00
                  {#if point.hour === currentHour}
                    <span class="badge badge-secondary badge-xs ml-2">Jetzt</span>
                  {/if}
                </td>
                <td>{point.globalValue}</td>
                <td>{point.userValue ?? '—'}</td>
                <td>
                  {#if point.hasUserData}
                    <span class="material-symbols-outlined text-success text-sm">check_circle</span>
                  {:else}
                    <span class="material-symbols-outlined text-base-content/30 text-sm">radio_button_unchecked</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .card-modern {
    @apply bg-base-100 rounded-2xl shadow-lg border border-base-300;
  }
  
  .chart-wrapper {
    @apply w-full;
  }
  
  svg {
    max-width: 100%;
    height: auto;
  }
  
  /* Mobile: Chart im Panorama-Format, kein Scroll */
  svg.mobile-chart {
    aspect-ratio: 16 / 9;
    min-height: 200px;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
