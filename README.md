# 💊 Farmacare API

API REST para gestión de medicamentos de adultos mayores.  
Stack: **Node.js + Express + Sequelize + MySQL**

---

## Estructura del proyecto

```
farmacare-api/
├── src/
│   ├── app.js                  # Entry point
│   ├── config/
│   │   ├── database.js         # Conexión Sequelize
│   │   └── syncDb.js           # Script para sincronizar tablas
│   ├── models/
│   │   ├── index.js            # Asociaciones entre modelos
│   │   ├── AuthUser.js
│   │   ├── Patient.js
│   │   ├── Caregiver.js
│   │   ├── Medication.js
│   │   ├── DoseRecord.js
│   │   ├── Invite.js
│   │   ├── AppNotification.js
│   │   ├── PatientMessage.js
│   │   └── DoctorAppointment.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── medicationController.js
│   │   ├── doseController.js
│   │   ├── caregiverController.js
│   │   ├── inviteController.js
│   │   ├── reportController.js
│   │   ├── notificationController.js
│   │   ├── messageController.js
│   │   └── appointmentController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.js             # Validación JWT
│   │   └── errorHandler.js     # Errores globales + 404
│   └── utils/
│       └── ApiError.js         # Clase de error + helpers de respuesta
├── .env.example
├── .gitignore
└── package.json
```

---

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Edita .env con tus datos de MySQL y JWT

# 3. Crear la base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE farmacare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Levantar el servidor (sincroniza tablas automáticamente)
npm run dev
```

El servidor corre en `http://localhost:3000/api/v1`

---

## Manejo de errores

Todos los errores devuelven JSON con esta estructura:

```json
{
  "error": {
    "status": 404,
    "message": "No encontrado — el recurso que buscas no existe.",
    "details": []   // solo cuando hay validaciones múltiples
  }
}
```

| Código | Significado                        |
|--------|------------------------------------|
| 400    | Datos inválidos / faltantes        |
| 401    | No autenticado / token inválido    |
| 403    | Sin permiso                        |
| 404    | Recurso no encontrado              |
| 409    | Conflicto (email duplicado, etc.)  |
| 500    | Error interno del servidor         |

---

## Autenticación

Todos los endpoints (excepto `/auth/*`) requieren el header:

```
Authorization: Bearer <accessToken>
```

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/register | Registrar cuenta |
| POST | /auth/login | Iniciar sesión |
| GET | /patients | Mis pacientes |
| POST | /patients | Crear paciente |
| GET | /patients/:id/medications | Medicamentos |
| GET | /patients/:id/doses/today | Schedule del día |
| POST | /patients/:id/medications/:medId/doses | Registrar toma |
| GET | /patients/:id/reports/compliance | Reporte cumplimiento |
