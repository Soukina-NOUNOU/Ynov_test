#!/bin/bash

# Chemin vers votre répertoire Terraform pour le registre
TERRAFORM_REGISTRY_DIR="infra/registry/"
# Chemin où l'inventaire Ansible sera généré
ANSIBLE_INVENTORY_PATH="ansible_inventory.ini"

echo "Génération de l'inventaire Ansible pour le registre..."

# Récupérer l'IP publique de l'instance EC2
INSTANCE_IP=$(terraform -chdir="${TERRAFORM_REGISTRY_DIR}" output -raw instance_ip)
if [ -z "$INSTANCE_IP" ]; then
  echo "Erreur: Impossible de récupérer l'IP publique de l'instance Terraform."
  exit 1
fi

# Récupérer le chemin de la clé privée SSH
PRIVATE_KEY_PATH=$(terraform -chdir="${TERRAFORM_REGISTRY_DIR}" output -raw private_key_path)
if [ -z "$PRIVATE_KEY_PATH" ]; then
  echo "Erreur: Impossible de récupérer le chemin de la clé privée SSH."
  exit 1
fi

# Générer le fichier d'inventaire Ansible
cat <<EOF > "${ANSIBLE_INVENTORY_PATH}"
[registry_hosts]
registry_server ansible_host=${INSTANCE_IP}

[registry_hosts:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=${PRIVATE_KEY_PATH}
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

echo "Inventaire Ansible généré avec succès à : ${ANSIBLE_INVENTORY_PATH}"
echo "Contenu de l'inventaire :"
cat "${ANSIBLE_INVENTORY_PATH}"