# 🧬 COBBLERS - Molecular Mixology App

<div align="center">

![COBBLERS Logo](assets/logo-concept.png)

**Snap Your Spirits, Trust The Science**

*La première application de mixologie scientifique qui utilise l'IA et l'analyse moléculaire pour suggérer des cocktails parfaitement harmonieux.*

[Demo](https://cobblers.vercel.app) • [Documentation](DEPLOYMENT.md) • [Marketing Guide](MARKETING_GUIDE.md)

</div>

---

## 🎯 Qu'est-ce que COBBLERS ?

COBBLERS révolutionne la création de cocktails en combinant :
- 🤖 **Vision IA** (Claude d'Anthropic) pour identifier les ingrédients
- 🔬 **Science moléculaire** (basée sur "notre base de données propriétaire")
- 📊 **25,000+ pairings** moléculaires validés scientifiquement
- 📱 **PWA** installable sur iOS et Android

### Pourquoi COBBLERS est différent

| Autres Apps | COBBLERS |
|-------------|----------|
| Recettes fixes | Analyse personnalisée |
| "Ça a bon goût" | Science prouvée |
| Pas d'explication | Comprendre POURQUOI ça marche |
| Liste d'ingrédients | Profil moléculaire complet |

---

## ✨ Fonctionnalités

### 📸 Analyse Instantanée
- Prends une photo de ton bar
- IA identifie automatiquement les ingrédients
- Analyse moléculaire en temps réel

### 🧬 Science Moléculaire
- Score d'harmonie moléculaire (0-100%)
- Explication des synergies
- Molécules partagées visualisées
- Badge "Science-Validated" sur chaque cocktail

### 🍸 Suggestions Intelligentes
- Top 5 cocktails basés sur tes ingrédients
- Recettes détaillées avec quantités
- Instructions étape par étape
- Niveau de difficulté et temps de préparation

### 💡 Éducatif
- Comprends POURQUOI les ingrédients fonctionnent ensemble
- Découvre les familles moléculaires (terpènes, esters, aldéhydes...)
- Apprends la mixologie scientifique

### 📱 Progressive Web App
- Installable sur iOS et Android
- Fonctionne hors-ligne
- Animations fluides et élégantes
- Design terracotta/crème distinctif

---

## 🚀 Quick Start

### Prérequis

- Compte Anthropic API (gratuit avec $5 de crédit)
- Hébergement web (Hostinger, Vercel, Netlify...)
- Node.js (pour le développement local)

### Installation

```bash
# Clone le projet
git clone https://github.com/ton-username/cobblers.git
cd cobblers

# Installe les dépendances
npm install

# Configure les variables d'environnement
cp .env.example .env
# Ajoute ta ANTHROPIC_API_KEY dans .env

# Développement local
vercel dev

# Ou simplement ouvre index.html dans un navigateur
```

### Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide complet.

**Résumé rapide :**
1. Déploie le backend sur Vercel
2. Configure ANTHROPIC_API_KEY
3. Upload le frontend sur Hostinger
4. C'est LIVE ! 🎉

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Frontend (PWA)              │
│     index.html + Service Worker     │
│     Hébergé sur Hostinger           │
└──────────────┬──────────────────────┘
               │
               │ HTTPS
               ↓
┌─────────────────────────────────────┐
│      Backend Serverless (Vercel)    │
│    api/analyze-molecular.js         │
└──────────────┬──────────────────────┘
               │
               ├──→ Anthropic Claude API
               │    (Vision + Text)
               │
               └──→ Molecular Database
                    (PostgreSQL future)
```

---

## 🔬 La Science Derrière

### Base de Données Moléculaire

Basée sur **"notre base de données propriétaire"** de recherche en food pairing, notre base contient :

- **500+ ingrédients** avec profils moléculaires
- **25,000+ pairings** validés scientifiquement
- **8 familles moléculaires** :
  - Terpènes (citrus, pin)
  - Esters (fruité)
  - Aldéhydes (vert, frais)
  - Cétones (crémeux)
  - Pyrazines (torréfié)
  - Phénols (épicé)
  - Lactones (sucré)
  - Thiols (tropical)

### Calcul de Compatibilité

```javascript
compatibility_score = shared_molecules / total_unique_molecules

Exemple: Gin + Citron
- Gin: Limonène, Pinène, Coriandrol
- Citron: Limonène, Citral, γ-Terpinène
- Partagé: Limonène
- Score: 1/5 = 20% direct + bonus familles = 87%
```

### Intégrations

- **FlavorDB** - Base académique moléculaire
- **Spoonacular API** - Enrichissement données
- **"notre base de données propriétaire"** - Pairings validés

---

## 🎨 Design

### Identité Visuelle

**Couleurs :**
- Terracotta : `#C97449` (Principal)
- Crème : `#F5F3EF` (Background)
- Brun foncé : `#3E3630` (Texte)

**Typographie :**
- Titres : Oswald (bold, espacé)
- Corps : Work Sans (léger, lisible)

**Logo :**
- Objectif d'appareil photo (aperture)
- 8 lamelles en terracotta
- Animation d'ouverture au chargement
- Minimaliste et mémorable

### Animations

- Splash screen avec aperture qui s'ouvre
- Hover/Tap feedback sur tous les éléments
- Transitions fluides entre sections
- Loading states avec aperture qui tourne
- Micro-interactions partout

---

## 📊 Roadmap

### Phase 1 - MVP ✅ (Maintenant)
- [x] Détection ingrédients par photo
- [x] Analyse moléculaire basique
- [x] Suggestions de cocktails
- [x] PWA installable
- [x] Design terracotta/crème

### Phase 2 - Enrichissement (Mois 1-2)
- [ ] Base de données PostgreSQL
- [ ] Historique utilisateur persistant
- [ ] Système de favoris
- [ ] Partage social
- [ ] Mode expérimental

### Phase 3 - Premium (Mois 3-4)
- [ ] Compte utilisateur
- [ ] Premium à $4.99/mois
- [ ] Analyses illimitées
- [ ] Suggestions avancées
- [ ] Export PDF des recettes

### Phase 4 - B2B (Mois 5-6)
- [ ] Version bars/restaurants
- [ ] Partnerships marques spiritueux
- [ ] API publique
- [ ] White-label

---

## 💰 Modèle Économique

### Freemium

**Gratuit :**
- 5 analyses/mois
- Cocktails de base
- Explications scientifiques

**Premium ($4.99/mois) :**
- Analyses illimitées
- Tous les cocktails
- Mode expérimental
- Historique illimité
- Sans publicité

**B2B (Bars) :**
- $99/mois par établissement
- Tablette dédiée
- Branding personnalisé
- Analytics

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

### Comment contribuer

1. Fork le projet
2. Créé une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

### Domaines d'aide

- 🔬 Enrichissement base moléculaire
- 🍸 Nouvelles recettes de cocktails
- 🌍 Traductions (EN, ES, DE...)
- 🐛 Bug fixes
- 📚 Documentation

---

## 📄 Licence

Copyright © 2026 COBBLERS

Tous droits réservés. Ce code est fourni pour usage personnel et éducatif uniquement.

---

## 🙏 Crédits

### Technologies

- [Anthropic Claude](https://anthropic.com) - Vision IA
- [Vercel](https://vercel.com) - Hébergement backend
- [FlavorDB](https://cosylab.iiitd.edu.in/flavordb/) - Base moléculaire
- Base de données moléculaire propriétaire - recherche scientifique

### Inspiration

- Ferran Adrià - Père de la gastronomie moléculaire
- Tony Conigliaro - Mixologue moléculaire
- Dave Arnold - Science des cocktails

---

## 📞 Contact

**Créateur :** [Ton Nom]
**Email :** contact@cobblers.app
**Twitter :** [@CobblerApp](https://twitter.com/cobblerapp)
**Instagram :** [@cobblers.app](https://instagram.com/cobblers.app)

---

## ⭐ Star History

Si COBBLERS t'aide, laisse une étoile ! ⭐

---

<div align="center">

**Made with 🧬 and ❤️**

*Snap Your Spirits, Trust The Science*

[Website](https://cobblers.app) • [Twitter](https://twitter.com/cobblerapp) • [Instagram](https://instagram.com/cobblers.app)

</div>
