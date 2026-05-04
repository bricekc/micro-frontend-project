# RetroShop — Projet Micro-Frontends (Module Federation)

## 🎯 Objectif

Construire une boutique en ligne **retro gaming** en **Micro-Frontends** (MFE) avec React et Webpack Module Federation.

## 🏗️ Architecture

| Service | Port | Rôle | Responsable |
|---------|------|------|-------------|
| **shell** | `3000` | Orchestrateur : charge les MFEs, header, badge panier | Étudiant A |
| **mfe-product** | `3001` | Grille de produits + bouton "Ajouter au panier" | Étudiant B |
| **mfe-cart** | `3002` | Panier latéral (liste, total, vider) | Étudiant C |
| **mfe-reco** | `3003` | Recommandations "Les joueurs achètent aussi" | Étudiant D |

> **Équipe de 3 :** ignorer le MFE `mfe-reco` et ses responsabilités associées.

---

## 👥 Répartition des rôles

### Étudiant A — Shell
- Configurer les remotes (URLs des MFEs)
- Implémenter les imports lazy + `Suspense`
- Ajouter un `ErrorBoundary` + `lazy().catch()` pour la résilience
- Gérer le badge du panier (écoute des mises à jour)

### Étudiant B — mfe-product
- Configurer le plugin **Webpack Module Federation**
- Exposer le composant grille produits
- Émettre un événement au clic sur "Ajouter au panier"

### Étudiant C — mfe-cart
- Configurer le plugin **Webpack Module Federation**
- Écouter les événements d'ajout au panier
- Émettre les mises à jour (total, nombre d'articles)
- Implémenter la fonction "Vider le panier"

### Étudiant D — mfe-reco
- Configurer le plugin **Webpack Module Federation**
- Écouter le contenu du panier
- Adapter les recommandations en fonction des articles ajoutés

---

## 📋 Déroulement du projet

### Phase 1 — Négociation du contrat

**⚠️ Avant de toucher au code**, l'équipe doit se mettre d'accord sur :

1. **Le nom exact** de chaque événement
2. **Le payload exact** (quelles propriétés, quels types)
3. **Qui émet quoi, qui écoute quoi**

> 💡 **Conseil :** Écrivez le contrat à l'écrit. Chaque membre le conserve.
> Si le contrat diverge au moment de l'assemblage, rien ne se passe. Pas d'erreur. Juste le silence.

---

### Phase 2 — Développement indépendant

Chacun travaille **seul** sur son MFE. **Aucune communication** entre les membres pendant cette phase.

- **Documentation unique :** `shared/eventBus.js` (lire le code source)
- **Déjà fourni :** tout le JSX (structure HTML + CSS), le layout du Shell, `shared/eventBus.js` et `shared/products.js`
- **À écrire :**
  - Votre `webpack.config.js` (Module Federation from scratch)
  - Les appels `emit()` et `on()` dans votre composant
  - Le `cleanup` dans les `useEffect`
  - Les imports lazy + ErrorBoundary + `lazy().catch()` dans le Shell (Étudiant A)

> 🔗 **Documentation Webpack :** [ModuleFederationPlugin | webpack](https://webpack.js.org/plugins/module-federation-plugin)

---

### Phase 3 — Assemblage

L'étudiant A (Shell) lance les terminaux :

```bash
# T1 — mfe-product
cd mfe-product && npm install && npm start

# T2 — mfe-cart
cd mfe-cart && npm install && npm start

# T3 — mfe-reco (si applicable)
cd mfe-reco && npm install && npm start

# T4 — shell
cd shell && npm install && npm start
```

Ouvrir [http://localhost:3000](http://localhost:3000) et observer le résultat.

---

### Phase 4 — Debug et rétrospective

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| Rien ne se passe au clic | Nom d'événement différent des deux côtés | Vérifier le contrat d'événement |
| "Loading..." infini | Mauvais port dans `remotes` | Vérifier la configuration des ports |
| "Invalid hook call" | React chargé plusieurs fois | Vérifier `singleton: true` dans `shared` |
| "Module does not exist" | Mauvaise clé dans `exposes` | Vérifier la clé d'exposition du module |

---

## ✅ Validation

- [ ] Les 4 services démarrent sans erreur
- [ ] Cliquer sur "Ajouter" dans le catalogue ajoute l'article au panier
- [ ] Le badge du header affiche le bon nombre d'articles
- [ ] Les recommandations changent selon le contenu du panier
- [ ] Vider le panier remet tout à zéro
- [ ] Tuer `mfe-reco` (`Ctrl+C`) ne casse pas le reste de la page

---

## 📚 Ressources

- [ModuleFederationPlugin | webpack](https://webpack.js.org/plugins/module-federation-plugin)
