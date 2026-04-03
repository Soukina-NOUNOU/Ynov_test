#!/bin/bash

 # On Récupère les outputs Terraform du registre et génère l'inventaire Ansible + la clé SSH


TERRAFORM_DIR="infra/registry"
INVENTORY_FILE="registry-inventory.ini"
KEY_FILE="registry-key.pem"

echo "=== Bridge Registre : récupération des outputs Terraform ==="

# 1. Récupérer l'IP publique du registre
REGISTRY_IP=$(terraform -chdir="${TERRAFORM_DIR}" output -raw instance_ip)
if [ -z "$REGISTRY_IP" ]; then
  echo "Erreur: Impossible de récupérer l'IP du registre."
  exit 1
fi
echo "IP du registre : ${REGISTRY_IP}"

# 2. Récupérer la clé privée SSH et l'écrire dans un fichier temporaire
terraform -chdir="${TERRAFORM_DIR}" output -raw private_key_pem > "${KEY_FILE}"
if [ ! -s "$KEY_FILE" ]; then
  echo "Erreur: Impossible de récupérer la clé privée SSH du registre."
  exit 1
fi
chmod 600 "${KEY_FILE}"
echo "Clé SSH écrite dans : ${KEY_FILE} (permissions 600)"

# 3. Générer l'inventaire Ansible
cat <<EOF > "${INVENTORY_FILE}"
[registry_hosts]
registry_server ansible_host=${REGISTRY_IP}

[registry_hosts:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${KEY_FILE}
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

echo "Inventaire Ansible généré : ${INVENTORY_FILE}"
cat "${INVENTORY_FILE}"

# 4. Exporter l'IP pour les steps suivants de la CI/CD
if [ -n "$GITHUB_ENV" ]; then
  echo "REGISTRY_IP=${REGISTRY_IP}" >> "$GITHUB_ENV"
  echo "Variable REGISTRY_IP exportée dans GITHUB_ENV"
fi

echo "=== Bridge Registre terminé ==="
