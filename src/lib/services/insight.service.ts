/**
 * Insight Service
 * 
 * Generiert Post-Test Mini-Insights basierend auf Screentime-Patterns
 * für Hook-Investment-Flow
 */

import { supabase } from './supabase.client';
import type { ScreenTimeBucket } from '$features/digitalLog/digitalLogTypes';

export interface PostTestInsight {
  hasEnoughData: boolean;
  headline: string;
  body: string;
  pattern?: {
    highScreentimeAvgScore: number;
    lowScreentimeAvgScore: number;
    difference: number;
    highCount: number;
    lowCount: number;
  };
}

interface EntryWithScore {
  score: number;
  screentime: ScreenTimeBucket;
  date: string;
}

/**
 * Holt Post-Test Insight basierend auf bisherigen Screentime-Patterns
 * 
 * @param userId User ID
 * @param currentBucket Gerade eingegebener Screentime-Bucket (optional, für kontextuelle Insights)
 * @returns PostTestInsight mit Pattern-Analyse
 */
export async function getPostTestInsight(
  userId: string,
  currentBucket?: ScreenTimeBucket
): Promise<PostTestInsight> {
  try {
    // 1. Hole alle Sessions mit BrainScore + Digital Log
    const { data: sessions, error } = await supabase
      .from('sart_sessions')
      .select(`
        id,
        brain_score,
        created_at,
        digital_logs (
          screen_time_bucket
        )
      `)
      .eq('user_id', userId)
      .not('brain_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(30) as {
        data: Array<{
          id: string;
          brain_score: number;
          created_at: string;
          digital_logs: Array<{ screen_time_bucket: ScreenTimeBucket }> | null;
        }> | null;
        error: any;
      };

    if (error) {
      console.error('Error fetching sessions for insight:', error);
      return getDefaultInsight();
    }

    // 2. Filtere: Nur Sessions mit Screentime-Daten
    const entriesWithData: EntryWithScore[] = (sessions || [])
      .filter(s => s.digital_logs && s.digital_logs.length > 0)
      .map(s => ({
        score: s.brain_score,
        screentime: s.digital_logs![0].screen_time_bucket,
        date: s.created_at.split('T')[0]
      }));

    // 3. Check: Genug Daten?
    if (entriesWithData.length < 3) {
      return {
        hasEnoughData: false,
        headline: 'Danke für deinen Check-in!',
        body: 'Je mehr Tage du eingibst, desto mehr können wir dir zeigen, wie deine Handyzeit und dein Fokus zusammenhängen. Mach weiter so! 💪'
      };
    }

    // 4. Kategorisiere: High vs. Low Screentime
    const highScreentimeEntries = entriesWithData.filter(
      e => e.screentime === '60-120' || e.screentime === '120plus'
    );
    const lowScreentimeEntries = entriesWithData.filter(
      e => e.screentime === '0-30' || e.screentime === '30-60'
    );

    // 5. Prüfe: Genug Daten in beiden Kategorien?
    if (highScreentimeEntries.length === 0 || lowScreentimeEntries.length === 0) {
      return {
        hasEnoughData: true,
        headline: 'Noch nicht genug Vielfalt',
        body: 'Du hast bisher hauptsächlich Tage mit ähnlicher Handynutzung eingegeben. Versuche, an unterschiedlichen Tagen zu testen – dann sehen wir mehr Muster! 📊'
      };
    }

    // 6. Berechne Durchschnitte
    const highAvg = average(highScreentimeEntries.map(e => e.score));
    const lowAvg = average(lowScreentimeEntries.map(e => e.score));
    const diff = lowAvg - highAvg; // Positiv: Low besser als High

    // 7. Generiere Insight basierend auf Differenz
    if (Math.abs(diff) >= 5) {
      // Signifikanter Unterschied
      const direction = diff > 0 ? 'niedriger' : 'höher';
      const betterCategory = diff > 0 ? 'weniger' : 'mehr';
      
      return {
        hasEnoughData: true,
        headline: 'Interessantes Muster erkannt! 🔍',
        body: `An Tagen mit mehr Handyzeit (>60 Min) lag dein BrainScore bisher im Schnitt ${Math.abs(Math.round(diff))} Punkte ${direction} als an Tagen mit ${betterCategory} Nutzung.`,
        pattern: {
          highScreentimeAvgScore: Math.round(highAvg),
          lowScreentimeAvgScore: Math.round(lowAvg),
          difference: Math.round(diff),
          highCount: highScreentimeEntries.length,
          lowCount: lowScreentimeEntries.length
        }
      };
    } else {
      // Kein klares Muster
      return {
        hasEnoughData: true,
        headline: 'Noch kein klares Muster',
        body: 'Deine bisherigen Daten zeigen noch keinen eindeutigen Zusammenhang zwischen Screentime und Fokus. Das ist völlig normal – manche Menschen sind resilient! Je mehr du einträgst, desto besser wird das Bild. 📈',
        pattern: {
          highScreentimeAvgScore: Math.round(highAvg),
          lowScreentimeAvgScore: Math.round(lowAvg),
          difference: Math.round(diff),
          highCount: highScreentimeEntries.length,
          lowCount: lowScreentimeEntries.length
        }
      };
    }
  } catch (err) {
    console.error('Error in getPostTestInsight:', err);
    return getDefaultInsight();
  }
}

/**
 * Hilfsfunktion: Durchschnitt berechnen
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Fallback Insight bei Fehlern
 */
function getDefaultInsight(): PostTestInsight {
  return {
    hasEnoughData: false,
    headline: 'Danke für deinen Check-in!',
    body: 'Wir konnten deine Daten gerade nicht abrufen, aber dein Check-in wurde gespeichert. Je mehr Tage du eingibst, desto mehr können wir dir zeigen!'
  };
}
