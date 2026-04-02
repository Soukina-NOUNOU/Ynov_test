# 🧪 Guide de test -- Registre Docker privé (Phase 1 & 2)

## 🎯 Objectif

Valider que : - Terraform provisionne correctement l'infrastructure -
Ansible configure correctement le registre Docker privé -
L'authentification fonctionne (login + push/pull)

------------------------------------------------------------------------

## ⚙️ Prérequis

-   Terraform
-   Ansible
-   AWS CLI configuré
-   Docker
-   OpenSSL

------------------------------------------------------------------------

## 🔐 Variables d'environnement

### Linux / Mac / Git Bash

``` bash
export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
export AWS_REGION="eu-west-3"
```

### Windows PowerShell

``` powershell
$env:AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
$env:AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
$env:AWS_REGION="eu-west-3"
```

Mot de passe temporaire registre :

    admin123

------------------------------------------------------------------------

## 🚀 Étape 1 -- Terraform (Phase 1)

``` bash
cd infra/registry
terraform init
terraform plan
terraform apply -auto-approve
```

### ✅ Vérifications

-   Instance EC2 créée
-   Outputs disponibles :
    -   `instance_ip`
    -   `registry_url`
-   Fichier `.pem` généré

------------------------------------------------------------------------

## 📦 Étape 2 -- Génération inventaire Ansible

``` bash
cd ..
./generate_ansible_inventory.sh
```

### ✅ Vérifications

-   Fichier `ansible_inventory.ini` créé
-   IP correcte

------------------------------------------------------------------------

## 🛠️ Étape 3 -- Ansible (Phase 2)

``` bash
ansible-playbook -i ansible_inventory.ini infra/registry/playbook.yml \
--extra-vars "registry_admin_password=admin123"
```

### ✅ Vérifications

-   Aucune erreur
-   Fichier `registry.crt` généré

------------------------------------------------------------------------

## 🔎 Étape 4 -- Vérification via SSH

``` bash
ssh -i infra/registry/registry_key_terraform.pem ubuntu@<IP>
```

### Vérifier Docker

``` bash
docker ps
```

### Vérifier fichiers

``` bash
ls -l /home/ubuntu/registry-stack/
ls -l /home/ubuntu/registry-stack/auth/
ls -l /home/ubuntu/registry-stack/certs/
```

### Vérifier htpasswd

``` bash
cat /home/ubuntu/registry-stack/auth/registry.password
```

------------------------------------------------------------------------

## 🌐 Étape 5 -- Test externe

### Accès UI

    https://<IP>

⚠️ Certificat auto-signé → warning normal

------------------------------------------------------------------------

## 🔐 Authentification Docker

``` bash
mkdir -p ~/.docker/certs.d/<IP>
cp registry.crt ~/.docker/certs.d/<IP>/ca.crt

docker login <IP> -u admin
```

------------------------------------------------------------------------

## 📦 Test push / pull

``` bash
docker pull hello-world

docker tag hello-world <IP>/test-image:latest
docker push <IP>/test-image:latest

docker rmi <IP>/test-image:latest
docker pull <IP>/test-image:latest
```

### ✅ Résultat attendu

-   Login OK
-   Push OK
-   Pull OK

------------------------------------------------------------------------

## 🧹 Nettoyage

``` bash
cd infra/registry
terraform destroy -auto-approve
```

------------------------------------------------------------------------

## ✅ Conclusion

Si tout fonctionne : - Infrastructure OK - Authentification OK -
Registre prêt pour CI/CD 🚀
