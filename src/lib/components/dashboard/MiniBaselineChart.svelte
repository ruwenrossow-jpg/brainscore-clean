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
  
  import type { BaselinePoint } from '$lib/types/forecast';
  import { onMount } from 'svelte';
  
  export let userBaseline: BaselinePoint[];
  export let currentHour: number = new Date().getHours();
  
  let chartError = false;
  let chartContainer: HTMLDivElement;
  
  // Chart Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Skalen
  const xScale = (hour: number) => (hour / 23) * chartWidth;
  const yScale = (value: number) => chartHeight - (value / 100) * chartHeight;
  
  // SVG Pfad generieren (für Kurven)
  function generatePath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    
    // Smooth Curve mit Catmull-Rom Splines (vereinfacht: Linear)
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    
    return path;
  }
  
  // Globale Baseline Pfad
  $: globalPath = generatePath(
    userBaseline.map((p) => ({
      x: xScale(p.hour),
      y: yScale(p.globalValue),
    }))
  );
  
  // User Baseline Pfad (nur Punkte mit User-Daten verbinden)
  $: userPath = (() => {
    const userPoints = userBaseline
      .map((p, i) => ({
        hour: p.hour,
        value: p.userValue ?? p.globalValue,
        hasData: p.hasUserData,
        index: i,
      }))
      .map((p) => ({
        x: xScale(p.hour),
        y: yScale(p.value),
        hasData: p.hasData,
      }));
    
    return generatePath(userPoints);
  })();
  
  // Datenpunkte (nur wo User-Daten vorhanden)
  $: dataPoints = userBaseline
    .filter((p) => p.hasUserData)
    .map((p) => ({
      hour: p.hour,
      x: xScale(p.hour),
      y: yScale(p.userValue ?? p.globalValue),
    }));
  
  // Aktueller Zeitpunkt (vertikale Linie)
  $: currentX = xScale(currentHour);
  
  // X-Achse Labels (alle 4 Stunden)
  $: xLabels = [0, 4, 8, 12, 16, 20].map((hour) => ({
    hour,
    x: xScale(hour),
    label: `${hour}:00`,
  }));
  
  // Y-Achse Labels (0, 50, 100)
  $: yLabels = [0, 50, 100].map((value) => ({
    value,
    y: yScale(value),
  }));
  
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
    <h3 class="text-xl font-bold text-base-content mb-4">
      Deine Baseline-Kurve
    </h3>
    
    {#if !chartError}
      <!-- SVG Chart -->
      <div class="chart-wrapper">
        <svg {width} {height} viewBox="0 0 {width} {height}" class="w-full h-auto">
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
            
            <!-- Globale Baseline (gestrichelte Linie) -->
            <path
              d={globalPath}
              fill="none"
              stroke="currentColor"
              stroke-opacity="0.3"
              stroke-width="2"
              stroke-dasharray="4 4"
            />
            
            <!-- User Baseline (durchgezogene Linie) -->
            <path
              d={userPath}
              fill="none"
              stroke="hsl(var(--p))"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            
            <!-- Datenpunkte (User-Daten) -->
            {#each dataPoints as { x, y, hour }}
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="hsl(var(--p))"
                stroke="hsl(var(--b1))"
                stroke-width="2"
              >
                <title>{hour}:00</title>
              </circle>
            {/each}
            
            <!-- Aktueller Zeitpunkt (vertikale Linie) -->
            <line
              x1={currentX}
              y1="0"
              x2={currentX}
              y2={chartHeight}
              stroke="hsl(var(--s))"
              stroke-width="2"
              stroke-dasharray="2 2"
            />
            <circle
              cx={currentX}
              cy="-5"
              r="4"
              fill="hsl(var(--s))"
            />
            
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
      
      <!-- Legende -->
      <div class="flex items-center gap-6 mt-4 text-sm text-base-content/60">
        <div class="flex items-center gap-2">
          <div class="w-8 h-0.5 border-t-2 border-dashed border-current opacity-30"></div>
          <span>Globale Baseline</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-0.5 bg-primary"></div>
          <span>Deine Baseline</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-0.5 h-4 bg-secondary border-dashed"></div>
          <span>Jetzt</span>
        </div>
      </div>
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
    @apply w-full overflow-x-auto;
  }
  
  svg {
    max-width: 100%;
    height: auto;
  }
  
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
</style>
