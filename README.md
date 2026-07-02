# Guest House Management System

A full-stack Guest House Management System built with **ASP.NET Core (.NET 10), React, Entity Framework Core, and SQL Server** to streamline room booking, guest management, maintenance tracking, and administrative operations.

---

## Live Demo

**Frontend:** http://guest-house-management-system-ten.vercel.app/

---

## Demo Credentials

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Role        | Admin                                               |
| Employee ID | EMP001                                              |
| Email       | [admin@guesthouse.com](mailto:admin@guesthouse.com) |
| Password    | admin123                                            |

Click **Use Demo Admin Account** on the login page to autofill the credentials.

---

# Features

### Authentication & Authorization

* JWT Authentication
* Secure Login
* Role-Based Access Control
* Protected API Endpoints

### Room Management

* Add Rooms
* Update Room Details
* View Available Rooms
* Track Occupancy
* Maintenance Status

### Booking Management

* Create Bookings
* Approve Bookings
* Check-In / Check-Out
* Booking History

### Guest Management

* Guest Registration
* Guest Stay Records
* Booking History

### Dashboard

* Room Statistics
* Booking Statistics
* Occupancy Overview
* Monthly Reports

### Maintenance

* Create Maintenance Requests
* Track Request Status
* Maintenance History

---

# Technology Stack

## Frontend

* React.js
* Vite
* Material UI
* React Router

## Backend

* ASP.NET Core Web API (.NET 10)
* Entity Framework Core
* JWT Authentication
* Role-Based Authorization

## Database

* SQL Server

## Deployment

* Frontend: Vercel
* Source Control: GitHub

---

# Project Structure

```text
GuestHouseManagementSystem
│
├── Controllers/
├── DTOs/
├── Data/
├── Migrations/
├── Models/
├── Properties/
│
├── guesthouse-frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── Program.cs
└── README.md
```

---

# API Security

All protected endpoints require a valid JWT access token.

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/Mehulllll-pixel/GuestHouseManagementSystem.git
```

## Backend

```bash
cd GuestHouseManagementSystem

dotnet restore

dotnet ef database update

dotnet run
```

Backend runs at:

```
https://localhost:7159
```

## Frontend

```bash
cd guesthouse-frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# API Endpoints

## Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/Auth/register |
| POST   | /api/Auth/login    |

## Rooms

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/Room      |
| POST   | /api/Room      |
| PUT    | /api/Room/{id} |
| DELETE | /api/Room/{id} |

## Bookings

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | /api/Booking               |
| POST   | /api/Booking               |
| PUT    | /api/Booking/approve/{id}  |
| PUT    | /api/Booking/checkin/{id}  |
| PUT    | /api/Booking/checkout/{id} |

## Dashboard

| Method | Endpoint                        |
| ------ | ------------------------------- |
| GET    | /api/Dashboard/summary          |
| GET    | /api/Dashboard/monthly-bookings |

---

# Project Status

### Completed

* JWT Authentication
* Role-Based Authorization
* Room Management
* Booking Management
* Guest Management
* Dashboard
* Maintenance Module
* Responsive React Frontend
* Live Deployment

### Planned Improvements

* Email Notifications
* Calendar Integration
* Docker Support
* CI/CD Pipeline
* Automated Testing

---

# Author

**Miilee Sharma**

GitHub: https://github.com/7mgppp

---

# License

This project is intended for educational and portfolio purposes.
