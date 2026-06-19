# Sistema de Monitoreo de Calidad del Agua - AquaLab 🌊

Sistema web inteligente para el monitoreo en tiempo real de la calidad del agua. Este proyecto permite la recolección, almacenamiento y visualización de parámetros físico-químicos del agua mediante **IoT**, y emite **notificaciones y alertas en tiempo real** cuando los parámetros exceden los rangos saludables, basándose en la clasificación de riesgo IRCA.

## 🚀 Arquitectura del Sistema

El proyecto sigue una arquitectura dividida en:

* **Backend:** Desarrollado en [NestJS](https://nestjs.com/) (Node.js) con TypeScript y PostgreSQL. Maneja la lógica de negocio, motor de reglas IRCA, ingesta MQTT, eventos Server-Sent Events (SSE) y correos.
* **Frontend:** Desarrollado en [Next.js](https://nextjs.org/) con React y Tailwind CSS para un diseño interactivo y responsivo.
* **Hardware (IoT):** Microcontroladores ESP32 que envían telemetría mediante MQTT de los sensores (ej. pH, Turbidez, Conductividad, Oxígeno disuelto y Temperatura).

## 🛠️ Tecnologías Principales

| Capa | Tecnología |
| :--- | :--- |
| **Base de Datos** | PostgreSQL 15 |
| **Backend** | NestJS, TypeORM, MQTT (Mosquitto), RxJS, Nodemailer |
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, Recharts / ApexCharts, Zustand |
| **IoT / Comunicación** | MQTT, Server-Sent Events (SSE), API REST |

## 📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:
* Node.js (v18+)
* PostgreSQL
* Un broker MQTT (ej. Eclipse Mosquitto)
* [Git](https://git-scm.com/)

## 🔧 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/JeronimoVR/monitoreo-agua
cd monitoreo-agua
```

### 2. Configurar la Base de Datos
Asegúrate de tener PostgreSQL ejecutándose y crea una base de datos para el proyecto. Por defecto, puedes llamarla `monitoreo_agua`.

### 3. Configuración del Backend (NestJS)

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   Copia el archivo de ejemplo y crea tu archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellena el archivo `.env` con tus credenciales de PostgreSQL, configuración MQTT, JWT_SECRET y datos de correo (para Nodemailer):

4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

### 4. Configuración del Frontend (Next.js)

1. Abre una nueva terminal y navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno:
   Copia el archivo de ejemplo y crea tu archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   Por defecto, el backend local funciona en el puerto 3001:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_STREAM_URL=http://localhost:3001/api/sse/stream
   ```
4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.