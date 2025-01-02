# AWS-Provider-Konfiguration
provider "aws" {
  region = "eu-central-1"
}

# Variablen
variable "user_id" {
  type    = string
  default = "unknown"
}

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "player_slots" {
  type    = number
  default = 10
}

# Sicherheitsgruppe für Minecraft-Server und SSH
resource "aws_security_group" "minecraft_sg" {
  name        = "minecraft-server-sg"
  description = "Security group for Minecraft server and SSH"

  # SSH-Zugriff (Port 22)
  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Minecraft-Zugriff (Port 25565)
  ingress {
    description = "Minecraft Server Access"
    from_port   = 25565
    to_port     = 25565
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Alle ausgehenden Verbindungen erlauben
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Minecraft-Security-Group"
  }
}

# EC2-Instanz für Minecraft-Server
resource "aws_instance" "minecraft_server" {
  ami           = "ami-0669b163befffbdfc" # Amazon Linux 2023 für eu-central-1
  instance_type = var.instance_type
  key_name      = "minecraft-keypair"

  vpc_security_group_ids = [aws_security_group.minecraft_sg.id]

  tags = {
    Name  = "Minecraft-Server-${var.user_id}"
    Slots = var.player_slots
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo dnf update -y
              sudo dnf install -y java-21-amazon-corretto wget
              
              # Überprüfen, ob Java korrekt installiert ist
              java -version

              # Minecraft-Server einrichten
              cd /home/ec2-user
              wget https://piston-data.mojang.com/v1/objects/4707d00eb834b446575d89a61a11b5d548d8c001/server.jar -O minecraft_server.jar
              echo "eula=true" > eula.txt
              echo "max-players=${var.player_slots}" > server.properties
              
              # Minecraft-Server starten
              nohup java -Xmx2G -Xms1G -jar minecraft_server.jar nogui > server.log 2>&1 &
              EOF
}

# Ausgabe der öffentlichen IP-Adresse
output "instance_ip" {
  value = aws_instance.minecraft_server.public_ip
}
