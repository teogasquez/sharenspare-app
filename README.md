🟦 ShareNSpare — Monorepo Technique (Prototype + App)

Bienvenue dans le projet technique ShareNSpare.
Ce repo contient tout le code backend, frontend, packages partagés et infrastructure pour le prototype B2B utilisé par les festivals suisses.

Ce document explique :

comment le repo est structuré

comment installer le projet

comment contribuer (workflow Git à 2 personnes)

qui fait quoi (Téo / Kevin)

comment lancer le backend, le front, etc.

🚀 1. Objectif du projet

Ce monorepo sert à développer :

1) Le prototype Web B2B (Next.js)

Les festivals peuvent :

se connecter

gérer leur catalogue de matériel

consulter d’autres festivals

faire des demandes de location

générer devis / PDF

consulter les disponibilités

2) L’API Backend (ASP.NET Core)

gestion des festivals

catalogue matériel

workflow de demandes

pricing (TTC, HT, TVA)

upload photos (S3/Minio)

emails

PDF

audit

disponibilités

3) L'app mobile (plus tard)

Basée sur Expo (React Native).
Pas encore nécessaire pour le prototype.

🧱 2. Architecture du repo

Voici l’arborescence complète, avec l'utilité de chaque dossier :

sharenspare-app/
│
├── apps/
│   ├── api/            # Backend C# ASP.NET Core (logique métier)
│   ├── web/            # Prototype web B2B (Next.js)
│   └── mobile/         # App mobile (Expo) – plus tard
│
├── packages/
│   ├── ts-client/      # Client TypeScript auto-généré depuis l’API
│   ├── theme/          # Design tokens partagés (couleurs, typos...)
│   ├── headless/       # Logique métier front (pricing, validation...)
│   ├── ui-web/         # Composants React Web
│   └── ui-native/      # Composants React Native (plus tard)
│
├── infra/
│   ├── docker-compose.yml   # Postgres, Minio, Mailhog en local
│   └── seed/                # Données de démo pour la DB
│
├── .github/
│   └── workflows/      # CI/CD (API, Web, Mobile)
│
├── turbo.json          # Config Turborepo
├── package.json        # Scripts globaux (dev, build...)
├── pnpm-workspace.yaml # Déclaration des workspaces
├── README.md           # Ce fichier
└── .gitignore          # Fichiers ignorés par Git

🧩 3. Installation (première fois)
📌 Prérequis

Assure-toi d’avoir installé :

Node.js (v18+)

PNPM :

npm install -g pnpm


.NET 8 SDK

Docker Desktop

📦 Installer les dépendances
pnpm install

🐳 Lancer les services externes (DB, S3, Mailhog)
docker compose up -d


Cela lance :

PostgreSQL (base de données)

Minio (stockage type S3 pour les photos)

Mailhog (tests emails)

🚀 Lancer le backend
cd apps/api
dotnet watch


Backend accessible sur :
👉 http://localhost:5000

Swagger :
👉 http://localhost:5000/swagger

🌐 Lancer la webapp prototype (Next.js)

Depuis la racine :

pnpm dev


Next.js écoute généralement sur :
👉 http://localhost:3000

🧑‍🤝‍🧑 4. Répartition des responsabilités (TÉO / KEVIN)
TÉO :

Backend :

Auth (login / change password)

Organisations (settings)

Catalogue matériel (CRUD + upload)

Pricing TTC/HT/TVA (8.1%)

Audit

Configuration API & infrastructure

Frontend :

Login page

Catalogue pages

Pricing UI

Settings UI

Audit UI

Layout général

Packages :

ts-client

theme

ui-web

headless/pricing

Infra :

docker-compose

CI API & Web

turbo.json

KEVIN :

Backend :

Catégories & Tags

Disponibilités + calendrier

Workflow demandes (create, approve, start, close)

Emails

PDF (devis/factures)

Frontend :

Categories UI

Tags UI

Disponibilités UI

Demand workflow UI

Packages :

validation schemas si besoin

future ui-native

Infra :

seed (données de démo)

🔥 5. Comment contribuer (workflow Git simple et pro)
🚫 NE JAMAIS travailler sur main.

Toujours créer une branche.

🔁 Workflow complet
1️⃣ Créer une issue

Ex : “CRUD catégories backend”

2️⃣ Créer une branche depuis main :
git checkout main
git pull
git checkout -b feature/categories-backend

3️⃣ Développer uniquement ce qui concerne l’issue
4️⃣ Commit propre :
feat: add CRUD for categories

5️⃣ Push :
git push -u origin feature/categories-backend

6️⃣ Ouvrir une Pull Request

titre clair

description

assigner l’autre pour review

7️⃣ Review mutuelle

Kevin valide les PR de Téo
Téo valide celles de Kevin

8️⃣ Merge une fois approuvée
9️⃣ Supprimer la branche (GitHub propose automatiquement)
📝 6. Template de Pull Request (PR)

Crée le fichier :
.github/pull_request_template.md

# 📌 Titre de la PR

## 🧩 Description
- Qu’est-ce que cette PR apporte ?

## 🧪 Comment tester ?
- étapes simples pour tester

## 🔗 Issue liée
Closes #123

## ✔️ Checklist
- [ ] Le code compile
- [ ] Tests manuels faits
- [ ] Pas de code mort
- [ ] Pas de console inutile
- [ ] Compatible avec ts-client

✔️ 7. Lancer le projet au quotidien

Chaque matin :

git checkout main
git pull
docker compose up -d
pnpm dev


Puis créer ta branche et travailler dessus.

📬 8. Support / Questions

En cas de doute sur :

l’architecture

la logique métier

le workflow Git

la structure du monorepo

→ Voir ce README

🎉 Bienvenue dans le projet Sharenspare

Ce repo est organisé pour :

avancer vite

éviter les conflits Git

travailler proprement à deux

préparer l’app mobile plus tard

garder une cohérence totale dans le design et le code

On ship, on teste, on améliore. 🚀