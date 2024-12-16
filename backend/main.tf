provider "aws" {
  region = "eu-central-1"
}

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

resource "aws_instance" "minecraft_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Deine AMI-ID
  instance_type = var.instance_type
  key_name      = "minecraft-keypair" # SSH Key

  tags = {
    Name  = "Minecraft-Server-${var.user_id}"
    Slots = var.player_slots
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras enable java-openjdk21
              yum install -y java-21-openjdk
              cd /home/ec2-user
              wget https://launcher.mojang.com/v1/objects/your_minecraft_server.jar -O minecraft_server.jar
              echo "eula=true" > eula.txt
              echo "max-players=${var.player_slots}" > server.properties
              nohup java -Xmx2G -Xms1G -jar minecraft_server.jar nogui &
              EOF
}

output "instance_ip" {
  value = aws_instance.minecraft_server.public_ip
}
