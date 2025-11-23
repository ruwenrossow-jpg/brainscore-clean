# Vercel Deployment Setup

## 🚀 Quick Start

### 1. Environment-Variablen setzen

Gehe zu: **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**

Füge folgende Variablen hinzu:

```bash
VITE_SUPABASE_URL=https://afoqkgepibevlqvnwsqq.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb3FrZ2VwaWJldmxxdm53c3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDIxNDgsImV4cCI6MjA3OTIxODE0OH0.tZUTY0UF-IvStAwzWhiYu7Jo-tvvnJNFVUbtfts0W4g
```

**Wichtig:** Scope auf **Production, Preview, Development** setzen!

### 2. Supabase Redirect-URLs konfigurieren

Gehe zu: **Supabase Dashboard → Authentication → URL Configuration**

Füge hinzu:

**Site URL:**
```
https://brainscore-clean.vercel.app
```

**Redirect URLs:**
```
https://brainscore-clean.vercel.app
https://brainscore-clean.vercel.app/auth/callback
http://localhost:5173
http://localhost:5173/auth/callback
```

### 3. Redeploy

Nach dem Setzen der Environment-Variablen:

```bash
git push
```

Oder manuell in Vercel:
- Deployments → ⋯ → Redeploy

---

## 🔍 Troubleshooting

### Problem: "Seite lädt ewig"

**Ursache:** Environment-Variablen fehlen in Vercel

**Lösung:**
1. Prüfe Vercel Logs: Dashboard → Deployments → Build Logs
2. Suche nach: `❌ CRITICAL: Supabase environment variables missing!`
3. Setze Environment-Variablen (siehe oben)
4. Redeploy

### Problem: "Auth funktioniert nicht"

**Ursache:** Supabase kennt Vercel-URL nicht

**Lösung:**
1. Gehe zu Supabase Dashboard → Authentication → URL Configuration
2. Füge `https://brainscore-clean.vercel.app` hinzu
3. Speichern

### Problem: "Profile nicht gefunden"

**Ursache:** DB-Query timeout oder fehlerhafte Verbindung

**Lösung:**
1. Prüfe Supabase Project Status: https://status.supabase.com/
2. Prüfe Vercel Runtime Logs: Dashboard → Deployments → Functions
3. Suche nach DB-Query Errors

---

## 📋 Checklist für Production

- [ ] Environment-Variablen in Vercel gesetzt
- [ ] Supabase Redirect-URLs konfiguriert
- [ ] Git push → Deployment triggered
- [ ] Landing Page lädt (https://brainscore-clean.vercel.app)
- [ ] Login funktioniert
- [ ] Dashboard erreichbar nach Login

---

## 🛠️ Development vs Production

### Local Development
```bash
npm run dev
# Nutzt .env file
# Läuft auf localhost:5173
```

### Vercel Production
```bash
git push
# Nutzt Vercel Environment Variables
# Läuft auf brainscore-clean.vercel.app
```

**Wichtig:** `.env` wird NICHT zu Vercel deployed (ist in `.gitignore`)!

---

## 🔗 Nützliche Links

- Vercel Dashboard: https://vercel.com
- Supabase Dashboard: https://supabase.com/dashboard/project/afoqkgepibevlqvnwsqq
- Production App: https://brainscore-clean.vercel.app
- Debug Tool: https://brainscore-clean.vercel.app/debug/auth-status
