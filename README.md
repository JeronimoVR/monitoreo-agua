# Monitoreo de Calidad del Agua - Proyecto ARCA 🌊

Sistema inteligente para el monitoreo en tiempo real de la calidad del agua del arroyo en la Sede Sur de la Institución Universitaria Antonio José Camacho. Este proyecto utiliza **IoT**, **Inteligencia Artificial** y un enfoque de **Diseño Centrado en el Usuario (DCU)**.

## 🚀 Arquitectura del Sistema

El proyecto sigue una arquitectura de microservicios orquestada con **Docker**, dividida en:

* **Backend:** Desarrollado en [NestJS](https://nestjs.com/) (Node.js) con TypeScript y PostgreSQL.
* **Frontend:** Desarrollado en [Next.js](https://nextjs.org/) con Tailwind CSS para un diseño mobile-first.
* **IA-Service:** Microservicio en Python para el procesamiento del modelo de clasificación y predicción de riesgo.
* **Hardware (Firmware):** Código en C++ para microcontroladores ESP32 y sensores de pH, Turbidez, Conductividad, Oxígeno disuelto y Temperatura.

## 🛠️ Tecnologías Principales

| Capa | Tecnología |
| :--- | :--- |
| **Infraestructura** | Docker, Docker Compose |
| **Base de Datos** | PostgreSQL 15 |
| **Backend** | NestJS, TypeORM |
| **Frontend** | Next.js 14 (App Router) |
| **IoT** | C++, protocolo HTTP/JSON |

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)
* Node.js (Opcional, para desarrollo local fuera de Docker)

## 🔧 Instalación y Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/monitoreo-agua-arca.git](https://github.com/tu-usuario/monitoreo-agua-arca.git)
   cd monitoreo-agua-arca