# GlowGenie — Full-stack beauty e-commerce starter

## Stack
- Frontend: React + Vite
- Backend: Java 21 + Spring Boot 3 + Spring Data JPA
- Database: MySQL

## 1. Create the database
Your MySQL Workbench connection uses port **3307**. Run this in Workbench:

```sql
CREATE DATABASE IF NOT EXISTS glowgenie_new;
```

This is a fresh database name; it does not delete or change your existing `glowgenie` database.

## 2. Configure the backend
Set your local MySQL credentials in the environment before starting the backend. In PowerShell:

```powershell
$env:DB_USERNAME = "your_mysql_username"
$env:DB_PASSWORD = "your_mysql_password"
```

In the `backend` folder, run:

```powershell
mvn spring-boot:run
```

The backend runs at http://localhost:8081. To seed the sample catalogue after startup:

```powershell
curl.exe -X POST http://localhost:8081/api/seed
```

## 3. Run the frontend
Open a second PowerShell window, navigate to the `frontend` folder, and run:

```powershell
npm install
npm run dev
```

Open http://localhost:5173

## Demo notes
- The project includes product browsing, search, category filters, cart, registration/login, checkout, order history and a basic admin product screen.
- Authentication is a simple learning-project implementation. Do not deploy it publicly as-is: production needs password hashing, JWT/session security, validation, payment gateway integration, HTTPS, and admin authorization.
- UPI is a selectable payment method only; no real payment is collected. COD is also recorded as an order choice.
