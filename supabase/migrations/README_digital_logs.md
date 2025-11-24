# Digital Logs - Datenbankschema

## Übersicht

Die `digital_logs` Tabelle speichert kategorienbasierte ScreenTime-Daten nach jedem Brainrot-Test.

## Migration ausführen

### Option 1: Supabase Dashboard (empfohlen für Testing)

1. Öffne Supabase Dashboard
2. Gehe zu SQL Editor
3. Kopiere Inhalt von `20250124_digital_logs.sql`
4. Führe aus

### Option 2: Supabase CLI

```bash
supabase db push
```

## Schema-Details

### Felder

- `id`: UUID (Primary Key)
- `test_id`: UUID (Foreign Key → `sart_sessions.id`)
- `screen_time_bucket`: TEXT ('0-30', '30-60', '60-120', '120plus')
- `main_categories`: TEXT[] (max. 2 Einträge: 'social', 'video', 'games', 'work', 'other')
- `pickup_frequency`: TEXT ('low', 'medium', 'high', 'veryHigh')
- `created_at`: TIMESTAMPTZ (auto)
- `updated_at`: TIMESTAMPTZ (nullable)

### Constraints

- **Unique**: Pro Test-Session nur 1 Digital Log (`unique_test_digital_log`)
- **Check**: ScreenTimeBucket muss einer der 4 Werte sein
- **Check**: MainCategories Array mit 1-2 Einträgen
- **Check**: PickupFrequency muss einer der 4 Werte sein

### Indexes

- `idx_digital_logs_test_id`: Schnelle Abfragen nach Test-ID
- `idx_digital_logs_created_at`: Zeitbereich-Analysen

### Row Level Security (RLS)

✅ Aktiviert

**Policies:**
- `SELECT`: User sieht nur eigene Logs (via `sart_sessions.user_id`)
- `INSERT`: User kann nur für eigene Tests Logs erstellen
- `UPDATE`: User kann nur eigene Logs aktualisieren

## API Endpoint

**POST** `/api/digital-log`

### Request Body

```json
{
  "testId": "uuid",
  "screenTimeBucket": "60-120",
  "mainCategories": ["social", "video"],
  "pickupFrequency": "high"
}
```

### Response

```json
{
  "success": true,
  "created": true
}
```

oder

```json
{
  "success": true,
  "updated": true
}
```

## Verwendung in UI

Nach dem SART-Test wird optional der Digital Check-in angezeigt:

1. **ScreenTime-Niveau** (4 Chips)
2. **Hauptnutzung** (5 Kategorien, max. 2 auswählen)
3. **Aktivierungsfrequenz** (4-Stufen-Skala)

→ Speichern schickt POST zu `/api/digital-log`

## Analyse-Möglichkeiten

Spätere Korrelationsanalysen:
- BrainScore vs. ScreenTime-Niveau
- BrainScore vs. App-Kategorie (Social/Video/Games)
- BrainScore vs. Aktivierungsfrequenz
- Tagestrends: Morgen vs. Abend

## Datenqualität

✅ **MVP-freundlich**: Kategorien statt exakte Zahlen
✅ **Friktionsarm**: 3-5 Taps zum Ausfüllen
✅ **Optional**: User kann überspringen
✅ **Schnell**: Keine Texteingaben

## Backup & Rollback

Falls Migration Probleme macht:

```sql
-- Rollback
DROP TABLE IF EXISTS digital_logs CASCADE;
```

Dann alte Migration erneut ausführen.
