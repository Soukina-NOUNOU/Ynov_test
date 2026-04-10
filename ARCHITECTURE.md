# Architecture - Projet Ynov-Connect

L'infrastructure tourne sur AWS et repose sur deux instances EC2 distinctes : un serveur de registre Docker et un serveur applicatif. Le deploiement est entierement pilote par GitHub Actions, sans intervention manuelle.

---

## EC2 Registre (Docker Registry prive)

- **Instance** : `t3.micro`, Ubuntu 24.04 LTS
- **Role** : stocker les images Docker buildees (frontend, API, migration)
- **Acces** : HTTPS sur le port 443, reverse proxy Nginx avec certificats auto-signes
- **Authentification** : `htpasswd`, mot de passe injecte depuis les secrets GitHub
- **SSH** : ouvert uniquement le temps de la configuration par Ansible

---

## EC2 Applicatif (Serveur de production)

- **Instance** : `t3.micro`, Ubuntu 24.04 LTS
- **Role** : faire tourner la stack complete via `docker-compose.prod.yml`

Ports exposes publiquement :

| Port | Service |
|------|---------|
| 3000 | Frontend React |
| 8000 | API FastAPI |
| 8080 | Adminer (admin BDD) |

Le port MySQL (3306) reste fermé vers l'exterieur, accessible seulement en interne entre les conteneurs.

### Conteneurs lances

- `react` : interface utilisateur, image tiree depuis le registre prive
- `api` : backend Python/FastAPI
- `db` : MySQL, initialise avec les scripts de migration
- `adminer` : interface d'administration de la base de donnees

---

## Pipeline CI/CD

Le pipeline se lance manuellement depuis GitHub Actions et suit cet ordre :

1. Suppression des anciennes ressources AWS (instances, cles SSH, groupes de securite)
2. Provisionning Terraform du registre EC2, generation de la cle SSH a la volée
3. Configuration Ansible du registre (Docker + Nginx)
4. Provisionning Terraform du serveur applicatif
5. Build des images Docker et push vers le registre
6. Configuration Ansible du serveur applicatif : installation Docker, auth registre, copie des fichiers, generation du `.env`, lancement via `docker compose up -d`
7. Verification finale : appels `curl` sur le frontend (3000) et l'API (8000)

---

## Secrets et securite

Les cles SSH sont generees par Terraform (`tls_private_key`) et detruites apres usage. Aucune valeur sensible n'est ecrite en dur dans le code. Les identifiants AWS, le mot de passe du registre et les mots de passe MySQL sont tous stockes dans GitHub Secrets.
