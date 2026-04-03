#!/bin/bash

 # On Récupère les outputs Terraform du serveur app
# et génère l'inventaire Ansible + la clé SSH


TERRAFORM_DIR="infra/deploy"
INVENTORY_FILE="inventory.ini"
KEY_FILE="app-key.pem"

echo "=== Bridge App : récupération des outputs Terraform ==="

# 1. Récupérer l'IP publique du serveur app
SERVER_IP=$(terraform -chdir="${TERRAFORM_DIR}" output -raw instance_ip)
if [ -z "$SERVER_IP" ]; then
  echo "Erreur: Impossible de récupérer l'IP du serveur app."
  exit 1
fi
echo "IP du serveur app : ${SERVER_IP}" 

# 2. Récupérer la clé privée SSH et l'écrire dans un fichier temporaire
terraform -chdir="${TERRAFORM_DIR}" output -raw private_key_pem > "${KEY_FILE}"
if [ ! -s "$KEY_FILE" ]; then
  echo "Erreur: Impossible de récupérer la clé privée SSH de l'app."
  exit 1
fi
chmod 600 "${KEY_FILE}"
echo "Clé SSH écrite dans : ${KEY_FILE} (permissions 600)"

# 3. Générer l'inventaire Ansible
cat <<EOF > "${INVENTORY_FILE}"
[app_servers]
app_server ansible_host=${SERVER_IP}

[app_servers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${KEY_FILE}
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

echo "Inventaire Ansible généré : ${INVENTORY_FILE}"
cat "${INVENTORY_FILE}"

# 4. Exporter l'IP pour les steps suivants de la CI/CD
if [ -n "$GITHUB_ENV" ]; then
  echo "SERVER_IP=${SERVER_IP}" >> "$GITHUB_ENV"
  echo "Variable SERVER_IP exportée dans GITHUB_ENV"
fi

echo "=== Bridge App terminé ==="
