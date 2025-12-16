# 🚀 QUICK DEPLOYMENT GUIDE - RSG BANDA

## Status: ✅ Gotowy do deployment!

Git repository utworzone, kod gotowy. Teraz trzeba:

---

## KROK 1: Kup domenę rsgbanda.pl (5 min)

### Opcja A: OVH.pl (POLECANE)
1. **Idź na:** https://www.ovh.pl/domeny/
2. **Wpisz:** `rsgbanda.pl`
3. **Cena:** 39 zł/rok
4. **Zapłać:** Karta/Przelew/PayU
5. **Aktywacja:** 2-24h (zwykle 2-4h)

---

## KROK 2: Stwórz GitHub Repository (2 min)

```bash
# 1. Stwórz repo na GitHub:
# https://github.com/new
# Nazwa: rsg-banda
# Description: RSG Banda - Underground Streetwear Shop

# 2. Dodaj remote i push:
cd /Users/haos/azure-rsg
git remote add origin https://github.com/YOUR_USERNAME/rsg-banda.git
git push -u origin main
```

**UWAGA:** Zamień `YOUR_USERNAME` na swoją nazwę użytkownika GitHub!

---

## KROK 3: Deploy na Vercel (5 min)

### A. Przez Dashboard (łatwiejsze)
1. **Zaloguj się:** https://vercel.com/login
2. **New Project** → Import Git Repository
3. **Wybierz:** `rsg-banda` z GitHub
4. **Settings:**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: app/public
   Install Command: cd app && npm install
   ```
5. **Environment Variables:**
   ```
   NODE_ENV=production
   SESSION_SECRET=change-this-to-random-string-123456
   ```
6. **Deploy!** → Dostaniesz URL: `rsg-banda.vercel.app`

### B. Przez CLI (szybsze)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/haos/azure-rsg
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? rsg-banda
# - Directory? ./
# - Override settings? No
```

---

## KROK 4: Dodaj domenę do Cloudflare (10 min)

**CZEKAJ aż domena będzie aktywna w OVH!**

1. **Zaloguj się:** https://dash.cloudflare.com
2. **Add a Site** → `rsgbanda.pl`
3. **Plan:** Free ($0/month) ✅
4. **Cloudflare przeskanuje DNS** i da Ci 2 nameservery:
   ```
   xxx.ns.cloudflare.com
   yyy.ns.cloudflare.com
   ```
   **SKOPIUJ JE!**

---

## KROK 5: Zmień nameservery w OVH (5 min)

1. **Panel OVH:** https://www.ovh.com/manager/web/
2. **Domeny** → `rsgbanda.pl` → **DNS servers**
3. **Modify DNS servers**
4. **Usuń stare**, dodaj nameservery z Cloudflare:
   ```
   xxx.ns.cloudflare.com
   yyy.ns.cloudflare.com
   ```
5. **Confirm**
6. **Propagacja:** 2-48h (zwykle 4h)

---

## KROK 6: Konfiguruj DNS w Cloudflare (3 min)

**Po zmianie nameserverów:**

1. **Cloudflare Dashboard** → rsgbanda.pl → **DNS** → **Records**
2. **Add record:**
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy status: Proxied (pomarańczowa chmurka ☁️)
   TTL: Auto
   ```
3. **Add record (www):**
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy status: Proxied ☁️
   ```
4. **Save**

---

## KROK 7: Dodaj domenę w Vercel (2 min)

1. **Vercel Dashboard** → rsg-banda → **Settings** → **Domains**
2. **Add:** `rsgbanda.pl` → Add
3. **Add:** `www.rsgbanda.pl` → Add
4. Vercel automatycznie skonfiguruje SSL

---

## KROK 8: Włącz SSL w Cloudflare (2 min)

1. **Cloudflare** → rsgbanda.pl → **SSL/TLS**
2. **Overview** → Encryption mode: **Full (strict)** ✅
3. **Edge Certificates:**
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

---

## KROK 9: Optymalizacje Cloudflare (opcjonalne, 5 min)

### Speed
- **Speed** → **Optimization:**
  - ✅ Auto Minify: JS, CSS, HTML
  - ✅ Brotli
  - ✅ Early Hints

### Security
- **Security** → **Settings:**
  - Security Level: Medium
  - ✅ Bot Fight Mode
  - ✅ Email Obfuscation

### Caching
- **Caching** → **Configuration:**
  - Browser Cache TTL: 4 hours
  - Caching Level: Standard

---

## ✅ WERYFIKACJA

Po ~4h od zmiany nameserverów:

```bash
# Test DNS
nslookup rsgbanda.pl

# Test HTTPS
curl -I https://rsgbanda.pl

# Otwórz w przeglądarce
open https://rsgbanda.pl
```

**Oczekiwane:**
- ✅ Status: 200 OK
- ✅ SSL: Zielona kłódka 🔒
- ✅ Cloudflare: CF-Ray header
- ✅ Load time: < 2s

---

## 🎉 GOTOWE!

RSG Banda działa na: **https://rsgbanda.pl**

### Koszty:
```
Domena (OVH):     39 zł/rok
Cloudflare:       0 zł (Free plan)
Vercel:           0 zł (Hobby plan)
SSL:              0 zł (Cloudflare)
------------------------
TOTAL:            39 zł/rok (~$10/year)
```

---

## 🐛 Troubleshooting

### "DNS not found"
- Czekaj 4-24h po zmianie nameserverów
- Sprawdź czy nameservery są poprawnie ustawione w OVH

### "Too many redirects"
- Cloudflare SSL/TLS → zmień na "Full (strict)"

### "Strona nie ładuje się"
- Sprawdź logi w Vercel Dashboard → Deployments → View Function Logs
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione

### "Images nie działają"
- Sprawdź czy folder `app/public/images/` jest w repozytorium
- Sprawdź Cloudflare → Page Rules (nie blokuj /images/*)

---

## 📞 Pomoc

- Cloudflare Community: https://community.cloudflare.com/
- Vercel Docs: https://vercel.com/docs
- OVH Support: https://www.ovh.pl/pomoc/

**Powodzenia! 🔥**
