# Supabase Migration ausführen

## Schritt 1: Migration in Supabase ausführen

1. Öffne dein Supabase Dashboard: https://supabase.com/dashboard
2. Wähle dein Projekt: `brainscore-clean`
3. Gehe zu **SQL Editor** (linkes Menü)
4. Klicke auf **New Query**
5. Kopiere den kompletten Inhalt aus: `supabase/migrations/create_daily_scores_table.sql`
6. Füge ihn in den SQL Editor ein
7. Klicke auf **Run** (oder Strg+Enter)

## Schritt 2: Migration verifizieren

Führe folgende Query aus, um zu prüfen, ob die Tabelle erstellt wurde:

```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'daily_scores';
```

Sollte einen Eintrag zurückgeben.

## Schritt 3: Erste Synchronisation testen

Nach dem ersten Login wird automatisch `syncDailyScoresFromSessions()` aufgerufen.
Das aggregiert alle bestehenden Test-Sessions zu DailyScores.

Du kannst es auch manuell testen mit:

```sql
-- Prüfe, ob DailyScores erstellt wurden
SELECT * FROM daily_scores ORDER BY date DESC LIMIT 10;
```

## Troubleshooting

**Problem: "relation daily_scores does not exist"**
→ Migration wurde noch nicht ausgeführt. Siehe Schritt 1.

**Problem: "permission denied for table daily_scores"**
→ RLS Policies wurden nicht korrekt erstellt. SQL erneut ausführen.

**Problem: "No daily_scores found"**
→ Noch keine Test-Sessions vorhanden ODER Sync nicht gelaufen.
→ Führe manuell aus: Dashboard öffnen (triggert automatisch Sync)
