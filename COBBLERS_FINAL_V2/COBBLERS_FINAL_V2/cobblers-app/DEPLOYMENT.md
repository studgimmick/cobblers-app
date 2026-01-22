# 🚀 COBBLERS - Guide de Déploiement Complet

## 📦 Ce que tu as reçu

```
cobblers-app/
├── index.html                    ← Application PWA complète
├── manifest.json                 ← Configuration PWA
├── service-worker.js             ← Mode offline
├── api/
│   └── analyze-molecular.js      ← Backend avec science moléculaire
├── assets/
│   └── icons/                    ← Icônes app (à générer)
└── README.md                     ← Guide principal
```

---

## 🎯 Déploiement en 3 Étapes

### ✅ Étape 1 : Déployer le Backend (Vercel) - 5 minutes

**1.1 Créé un compte Vercel** (gratuit)
- Va sur [vercel.com](https://vercel.com)
- Sign up with GitHub

**1.2 Créé un nouveau projet**
```bash
# Dans ton terminal
cd cobblers-app
npm init -y
```

**1.3 Créé vercel.json**
```json
{
  "functions": {
    "api/analyze-molecular.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

**1.4 Déploie sur Vercel**
```bash
# Installe Vercel CLI
npm install -g vercel

# Login
vercel login

# Déploie
vercel --prod
```

**1.5 Configure la clé API Anthropic**
```bash
# Via CLI
vercel env add ANTHROPIC_API_KEY

# Ou via Dashboard Vercel :
# Settings → Environment Variables
# ANTHROPIC_API_KEY = sk-ant-api03-XXX
```

**1.6 Note ton URL backend**
```
https://cobblers-abc123.vercel.app
```

---

### ✅ Étape 2 : Générer les Icônes - 2 minutes

**Option A : Automatique (Recommandé)**

Utilise [realfavicongenerator.net](https://realfavicongenerator.net) :
1. Upload ton logo COBBLERS (objectif aperture)
2. Génère toutes les tailles
3. Télécharge le ZIP
4. Extrais dans `assets/icons/`

**Option B : Manuel**

Créé ces tailles à partir de ton logo :
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

Nom les : `icon-72x72.png`, `icon-96x96.png`, etc.

**Design du logo :**
- Background : #F5F3EF (crème)
- Aperture : #C97449 (terracotta)
- Style minimaliste comme dans le logo showcase

---

### ✅ Étape 3 : Déployer le Frontend (Hostinger) - 5 minutes

**3.1 Configure l'URL backend**

Dans `index.html`, ligne ~1104 :
```javascript
const API_ENDPOINT = 'https://cobblers-abc123.vercel.app/api/analyze-molecular';
//                    ↑ Remplace par ton URL Vercel
```

**3.2 Upload sur Hostinger**

**Via cPanel (Le plus simple) :**
1. Connecte-toi à ton cPanel Hostinger
2. File Manager → `public_html/`
3. Upload tous les fichiers :
   - index.html
   - manifest.json
   - service-worker.js
   - Dossier `assets/` complet
   - Dossier `api/` (optionnel, juste pour référence)

4. C'est tout ! ✅

**Via FTP :**
```bash
# Avec FileZilla ou terminal
ftp ton-domaine.com
# Upload tous les fichiers dans public_html/
```

**3.3 Configure HTTPS**

Dans cPanel Hostinger :
1. SSL/TLS → Let's Encrypt
2. Active SSL pour ton domaine
3. Force HTTPS redirect

---

## 🧪 Test de l'Application

### 1. Ouvre ton site
```
https://ton-domaine.com
ou
https://cobblers.ton-domaine.com
```

### 2. Test sur mobile

**iPhone :**
1. Ouvre Safari
2. Va sur ton site
3. Tap "Partager" ⬆️
4. "Sur l'écran d'accueil"
5. L'icône COBBLERS apparaît ! 📱

**Android :**
1. Ouvre Chrome
2. Va sur ton site
3. Popup : "Installer COBBLERS"
4. Tap "Installer"
5. App installée ! 📱

### 3. Test de l'analyse

1. Prends une photo de test (ex: une bouteille + citron)
2. Upload dans l'app
3. Clique "Analyser"
4. Vérifie que :
   - ✅ Loading avec aperture qui tourne
   - ✅ Ingrédients détectés
   - ✅ Cocktails avec scores moléculaires
   - ✅ Explications scientifiques

---

## 🎨 Personnalisation

### Changer les Couleurs

Dans `index.html`, section `:root` (ligne ~20) :
```css
:root {
    --primary: #C97449;        /* Ta couleur principale */
    --bg-cream: #F5F3EF;       /* Background */
    --text-dark: #3E3630;      /* Texte */
}
```

### Changer le Tagline

Ligne ~895 :
```html
<div class="splash-tagline">Snap Your Spirits</div>
<!-- Change en : "Ton nouveau tagline" -->
```

### Ajouter Ton Logo

Dans `header` (ligne ~1000) :
```html
<div class="header-logo">
    <img src="assets/logo.png" alt="COBBLERS" style="height: 32px;">
    <span class="logo-text">COBBLERS</span>
</div>
```

---

## 📊 Analytics (Optionnel)

### Ajouter Google Analytics

Dans `<head>` de index.html :
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🔧 Troubleshooting

### ❌ "API request failed"

**Problème :** Backend ne répond pas

**Solutions :**
1. Vérifie l'URL backend dans index.html
2. Vérifie que ANTHROPIC_API_KEY est configurée dans Vercel
3. Check les logs Vercel Dashboard

### ❌ Images ne s'affichent pas

**Problème :** Chemins d'images incorrects

**Solution :**
```bash
# Vérifie la structure :
public_html/
├── index.html
├── assets/
│   └── icons/
│       └── icon-192x192.png  ← Doit être là
```

### ❌ PWA n'est pas installable

**Problème :** manifest.json ou HTTPS manquant

**Solutions :**
1. Vérifie que manifest.json est accessible : `ton-domaine.com/manifest.json`
2. Vérifie HTTPS actif (cadenas dans navigateur)
3. Vérifie toutes les icônes présentes

### ❌ Service Worker erreur

**Problème :** Chemins de cache incorrects

**Solution :**
Dans `service-worker.js`, vérifie les chemins :
```javascript
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png'
];
```

---

## 💰 Coûts Mensuels Estimés

| Service | Coût | Usage |
|---------|------|-------|
| **Hostinger** | 5€/mois | Hébergement web |
| **Vercel** | 0€ | Backend (gratuit jusqu'à 100GB) |
| **Anthropic API** | ~15€ | ~1000 analyses/mois |
| **Domaine** | ~1€/mois | ton-domaine.com |
| **TOTAL** | **~21€/mois** | Pour commencer |

**Pour 100 utilisateurs actifs :** ~25-30€/mois
**Pour 1000 utilisateurs :** ~50-80€/mois

---

## 📈 Scaling (Quand tu grandis)

### Plus de 1000 utilisateurs/mois

**Backend :**
- Vercel Pro : $20/mois (illimité)
- Ou migration vers VPS dédié

**API :**
- Anthropic : Volume pricing
- Ou cache les résultats communs

**Database :**
- Ajoute PostgreSQL (Supabase gratuit ou $25/mois)
- Store historique utilisateurs
- Cache les pairings moléculaires

---

## 🚀 Prochaines Étapes

### Après le lancement :

1. **Marketing**
   - Share sur Product Hunt
   - Posts Instagram/TikTok
   - Contact influenceurs mixologie

2. **Analytics**
   - Track usage avec Google Analytics
   - Feedback utilisateurs
   - A/B testing des suggestions

3. **Features**
   - Système de favoris
   - Historique persistant
   - Mode expérimental
   - Partage social

4. **Monétisation**
   - Premium à $4.99/mois
   - Unlimited analyses
   - Features avancées

---

## 📞 Support

**Problèmes techniques :**
1. Check les logs Vercel
2. Check la console navigateur (F12)
3. Vérifie la documentation Anthropic API

**Besoin d'aide :**
- Documentation Hostinger : support.hostinger.com
- Documentation Vercel : vercel.com/docs
- Anthropic API : docs.anthropic.com

---

## ✅ Checklist Finale

Avant de lancer :

- [ ] Backend déployé sur Vercel
- [ ] ANTHROPIC_API_KEY configurée
- [ ] URL backend mise à jour dans index.html
- [ ] Icônes générées et uploadées
- [ ] Frontend déployé sur Hostinger
- [ ] HTTPS actif
- [ ] Test sur mobile (iOS + Android)
- [ ] Installation PWA testée
- [ ] Analyse photo testée
- [ ] Résultats affichés correctement
- [ ] Scores moléculaires visibles
- [ ] Explications scientifiques présentes

**Tout est ✅ ? LANCE ! 🚀**

---

## 🎉 Tu es Prêt !

Ton app COBBLERS est maintenant **LIVE** avec :
- ✅ Science moléculaire intégrée
- ✅ Logo Aperture avec animations
- ✅ PWA installable
- ✅ Backend serverless
- ✅ Design terracotta/crème
- ✅ Optimisé mobile

**Félicitations ! Maintenant, fais connaître COBBLERS au monde ! 🍸🧬**
