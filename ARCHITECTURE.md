# Documentation Architecturale : Projet "Zero Touch"

Ce document présente l'architecture finale et le fonctionnement de la chaîne de déploiement continu du projet **Ynov-Connect**. L'objectif principal est d'atteindre un déploiement "Zero Touch" : une infrastructure éphémère provisionnée, configurée et déployée de manière 100% automatisée manuellement depuis GitHub Actions, sans aucune connexion SSH manuelle.

---

## Vue d'ensemble de l'Architecture

L'infrastructure est hébergée sur **AWS** (Région `eu-west-3` - Paris) et se compose de **deux instances EC2 distinctes**, créées dynamiquement à chaque exécution du pipeline :

1.  **Serveur de Registre (Docker Registry Privé)**
2.  **Serveur Applicatif (Environnement de Production)**

### Schéma logique simplifié

```text
[ GitHub Actions (CI/CD) ]
       |
       |-- (1) Terraform provisionne --> [ EC2 Registre ] & [ EC2 Applicatif ]
       |
       |-- (2) Build & Push Images  ---> [ EC2 Registre ] (Images stockées)
       |
       |-- (3) Ansible configure    ---> [ EC2 Applicatif ]
       |                                       |-- Tire les images depuis le Registre
       |                                       |-- Lance Docker Compose
       v
 [ Déploiement Terminé & Validé ]
```

---

## Détail des Composants Infrastructure

### 1. Le Registre Docker Privé (Instance EC2 n°1)
*   **Type d'instance** : Adapté au Free Tier (`t3.micro`).
*   **OS** : Ubuntu 24.04 LTS (Dernière version dynamique).
*   **Rôle** : Héberger de manière sécurisée les images Docker de l'application (Frontend, API, Migrations).
*   **Sécurité & Réseau** :
    *   Accessible en **HTTPS (Port 443)** via un reverse proxy Nginx (Certificats auto-signés générés à la volée).
    *   Authentification requise (`htpasswd`) avec mot de passe injecté via les secrets GitHub.
    *   Port SSH (22) ouvert **uniquement** pour la configuration initiale par Ansible depuis le runner GitHub.

### 2. Le Serveur Applicatif (Instance EC2 n°2)
*   **Type d'instance** : Adapté au Free Tier (`t3.micro`).
*   **OS** : Ubuntu 24.04 LTS (Dernière version dynamique).
*   **Rôle** : Héberger la stack applicative complète "Ynov-Connect".
*   **Réseau & Ports exposés** :
    *   **Port 80** : Non exposé (redirigé vers le 3000 par défaut ou géré en interne).
    *   **Port 3000** : Frontend React accessible publiquement.
    *   **Port 8000** : API Backend FastAPI accessible publiquement.
    *   **Port 8080** : Interface Adminer pour l'administration de la base de données.
    *   **Port 22** : Ouvert temporairement pour le provisionnement Ansible.
    *   **Port 3306 (MySQL)** : Fermé à l'extérieur, accessible uniquement dans le réseau interne Docker.

---

## Stack Applicative (Docker Compose)

Le serveur applicatif fait tourner les conteneurs suivants via `docker-compose.prod.yml` :

-   **`react`** : L'interface utilisateur (Frontend). Consomme l'image stockée sur le registre privé.
-   **`api`** : Le backend en Python/FastAPI. Gère la logique métier et se connecte à la base de données.
-   **`db`** : Base de données MySQL (v9.6/8.0). Initialisée avec les scripts de migration transférés par Ansible. Protégée par des variables d'environnement (Mots de passe injectés par CI/CD).
-   **`adminer`** : Outil léger d'administration de la base de données.

---

## Flux d'Orchestration CI/CD (Pipeline "Zero Touch")

Le pipeline défini dans `.github/workflows/deploy.yml` est déclenché manuellement (`workflow_dispatch`) et suit ces étapes séquentielles :

1.  **Nettoyage (Clean-up)** : Destruction automatique des anciennes instances EC2, Groupes de Sécurité, et Paires de clés (Key Pairs) pour garantir un environnement totalement neuf (Éphémère).
2.  **Provisionning Terraform (Registre)** : Création de l'infrastructure réseau et EC2 du registre. Génération de la clé SSH "à la volée".
3.  **Bridge CI/CD (Registre)** : Extraction de l'IP publique et de la clé SSH depuis Terraform vers le runner pour générer un inventaire Ansible dynamique.
4.  **Configuration Ansible (Registre)** : Installation de Docker et configuration du Nginx sécurisé sur le serveur de registre.
5.  **Provisionning Terraform (App)** : Création du serveur applicatif EC2 et de ses règles de sécurité.
6.  **Bridge CI/CD (App)** : Récupération des outputs Terraform du serveur applicatif.
7.  **Build & Publish** : Construction des images Docker (`api`, `react`, `migration`) et envoi vers le registre EC2 fraîchement créé.
8.  **Configuration & Déploiement Ansible (App)** : 
    *   Installation de Docker.
    *   Authentification au registre privé.
    *   Copie des fichiers sources (`docker-compose.yml`, scripts SQL).
    *   Création dynamique du fichier `.env` avec les secrets.
    *   Lancement de la stack via `docker compose up -d`.
9.  **Validation Post-Déploiement** : Tests automatisés (`curl`) vérifiant que le Frontend (3000) et l'API (8000) répondent correctement avant de déclarer le pipeline "Succès".

---

## Sécurité & Gestion des Secrets

-   **Aucune clé codée en dur** : Les clés SSH d'administration sont générées dynamiquement par Terraform `tls_private_key`, injectées dans les instances AWS, puis transférées temporairement au Runner GitHub pour l'exécution d'Ansible, avant d'être détruites.
-   **GitHub Secrets** : L'ensemble des données sensibles (Identifiants AWS `AWS_ACCESS_KEY_ID`, mot de passe registre `REGISTRY_PASSWORD`, mots de passe base de données `MYSQL_ROOT_PASSWORD`) sont stockés dans le coffre-fort de GitHub Actions.
-   **Isolation** : Le serveur de base de données n'a pas de port public ouvert.

---