terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }
  required_version = ">= 1.2"
}

provider "aws" {
  region = "eu-west-3"
}

# 1. AMI Ubuntu 24.04 — recherche dynamique (pas de hardcode)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# 2. Génération de la clé SSH à la volée
resource "tls_private_key" "app_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "app_key" {
  key_name   = "app_key_terraform"
  public_key = tls_private_key.app_key.public_key_openssh
}

# 3. Security Group — ports strictement nécessaires
resource "aws_security_group" "app_sg" {
  name        = "app-sg"
  description = "Allow SSH, React (3000), API (8000)"

  ingress {
    description = "SSH (pour Ansible)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "React Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "FastAPI Backend"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Adminer"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # MySQL 3306 : PAS exposé (interne Docker uniquement)

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Instance EC2
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.app_key.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  tags = {
    Name = "ynov-app-server"
  }
}

# 5. Outputs pour le pipeline CI/CD
output "instance_ip" {
  value       = aws_instance.app_server.public_ip
  description = "IP publique du serveur applicatif"
}

output "private_key_pem" {
  value       = tls_private_key.app_key.private_key_pem
  description = "Clé privée SSH pour Ansible"
  sensitive   = true
}