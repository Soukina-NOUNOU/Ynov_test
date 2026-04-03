terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 5.92"
        }
    }

    required_version = ">= 1.2"
}

provider "aws" {
  region = "eu-west-3" # Paris
}

# 1. AMI Ubuntu 24.04
data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
  
}

# 2. Genetation de la clé SSH
resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "registry_key_terraform"
  public_key = tls_private_key.pk.public_key_openssh
}

# 3. Sauvegarder la clé privée locale pour Ansible
resource "local_file" "ssk_key" {
  filename = "${path.module}/registry_key_terraform.pem"
  content  = tls_private_key.pk.private_key_pem
  file_permission = "0400"
}

resource "aws_security_group" "registry_sg" {
  name        = "registry-sg-simple-ClickOpster"
  description = "Allow SSH, HTTP redirect (80), HTTPS (443)"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP (redirection vers HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (Nginx SSL Offloading)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 5000 (Registry API) : fermé depuis internet
  # Accessible uniquement en interne via le réseau Docker

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Instance EC2
resource "aws_instance" "registry_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  key_name      = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.registry_sg.id]

  tags = {
    Name = "Terraform-Registry-Server"
  }
}

# 5. Outputs (Pour récupérer l'IP publique de la machine)
output "instance_ip" {
  value = aws_instance.registry_server.public_ip
}

output "registry_url" {
  value = "https://${aws_instance.registry_server.public_ip}"
}

output "private_key_path" {
  value = local_file.ssk_key.filename
  description = "Path to the generated SSH private key file."
  sensitive = true 
}

output "private_key_pem" {
  value       = tls_private_key.pk.private_key_pem
  description = "Clé privée SSH en raw pour le pipeline CI/CD"
  sensitive   = true
}
