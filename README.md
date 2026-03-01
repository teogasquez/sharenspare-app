# ShareNSpare

Plateforme suisse de location de materiel entre festivals, evenements et particuliers.

## Stack technique

| Composant | Technologie |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | ASP.NET Core 9, C#, Entity Framework Core |
| Base de donnees | PostgreSQL 16 |
| Stockage photos | MinIO (compatible S3) |
| Paiements | Stripe Checkout |
| Cartes | Leaflet + Mapbox |
| Monorepo | pnpm workspaces + Turborepo |

## Prerequis

- **Node.js** >= 20
- **pnpm** >= 9
- **.NET SDK** 9.0
- **Docker** et **Docker Compose**

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/teogasquez/sharenspare-app.git
cd sharenspare-app
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
cp .env apps/api/.env
```

Remplir les valeurs dans `.env` :
- **Mapbox** : creer un compte sur [mapbox.com](https://www.mapbox.com/) et copier le token public
- **Stripe** (optionnel) : creer un compte sur [stripe.com](https://stripe.com/) et copier les cles de test depuis le dashboard

Creer aussi le fichier frontend :
```bash
echo "NEXT_PUBLIC_MAPBOX_TOKEN=votre-token-mapbox" > apps/web/.env.local
```

### 3. Lancer l'infrastructure Docker

```bash
cd infra
docker compose --env-file ../.env up -d
cd ..
```

Cela lance :
- **PostgreSQL** sur le port `5433`
- **MinIO** sur les ports `9000` (API) et `9001` (console)
- **Mailhog** sur les ports `1025` (SMTP) et `8025` (UI)

### 4. Installer les dependances frontend

```bash
pnpm install
```

### 5. Configurer la base de donnees

```bash
cd apps/api
dotnet tool install --global dotnet-ef  # si pas deja installe
dotnet ef database update
cd ../..
```

### 6. Lancer le projet

Dans deux terminaux separes :

**Backend (API)** :
```bash
cd apps/api
dotnet run
```
L'API demarre sur `http://localhost:5148` avec Swagger sur `/swagger`.

**Frontend** :
```bash
cd apps/web
pnpm dev
```
Le frontend demarre sur `http://localhost:3000`.

## Comptes de test

Au premier lancement, la base de donnees est peuplee avec des donnees de demo.
Les mots de passe sont configures via les variables d'environnement `SEED_ADMIN_PASSWORD` et `SEED_DEFAULT_PASSWORD`.

| Role | Email |
|------|-------|
| Admin | admin@sharenspare.ch |
| Festival (Montreux Jazz) | festival@example.com |
| Festival (Paleo) | paleo@example.com |
| Particulier | particulier@example.com |

## Structure du projet

```
sharenspare-app/
├── apps/
│   ├── api/                  # Backend ASP.NET Core
│   │   ├── Controllers/      # Endpoints API
│   │   ├── Data/             # DbContext et migrations
│   │   ├── DTOs/             # Data Transfer Objects
│   │   ├── Models/           # Entites EF Core
│   │   ├── Services/         # Services metier (JWT, Stripe, Storage)
│   │   └── Program.cs        # Point d'entree
│   └── web/                  # Frontend Next.js
│       ├── app/              # Pages (App Router)
│       ├── components/       # Composants React
│       └── lib/              # Client API, auth, utilitaires
├── infra/
│   └── docker-compose.yml    # PostgreSQL, MinIO, Mailhog
├── .env.example              # Template des variables d'environnement
├── turbo.json                # Configuration Turborepo
└── package.json              # Monorepo root
```

## Fonctionnalites

- Inscription et connexion (JWT)
- Gestion des organisations (festivals, particuliers)
- CRUD equipements avec photos (upload MinIO)
- Catalogue avec recherche, filtres par categorie et carte interactive
- Systeme de reservation avec workflow d'etats
- Calendrier de disponibilite avec periodes de blackout
- Paiement via Stripe Checkout (commission plateforme 15%)
- Dashboard admin avec statistiques
- Rate limiting et securite (CORS, headers, HTTPS)

## API Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| GET | `/equipments` | Liste des equipements |
| POST | `/equipments` | Creer un equipement |
| GET | `/catalogue` | Catalogue public |
| GET | `/equipments/{id}/availability` | Disponibilite d'un equipement |
| POST | `/equipments/{id}/blackouts` | Bloquer des dates |
| POST | `/reservations` | Creer une reservation |
| PATCH | `/reservations/{id}/status` | Changer le statut |
| POST | `/payments/{id}/checkout` | Creer un paiement Stripe |

## Variables d'environnement

Voir `.env.example` pour la liste complete. Les variables principales :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_SECRET` | Cle secrete pour les tokens JWT (min 32 caracteres) |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (mode test: `sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Cle publique Stripe (mode test: `pk_test_...`) |
| `MINIO_ENDPOINT` | URL du serveur MinIO |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token public Mapbox pour les cartes |
| `FRONTEND_URL` | URL du frontend (pour les redirections Stripe) |
| `ALLOWED_ORIGINS` | Origines CORS autorisees |

## Licence

Projet prive - Tous droits reserves.
