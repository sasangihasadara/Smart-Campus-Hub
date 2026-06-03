# 🎓 Smart Campus Operations Hub
### IT3030 – Programming Applications and Frameworks (2026, Semester 1)
**SLIIT – Faculty of Computing | Group 26**

---

## 📌 Project Overview

A full-stack web system for managing university facility bookings and maintenance/incident ticketing.

Built with **Spring Boot REST API** + **React (Vite)** client, secured with **OAuth 2.0 (Google Sign-In)**, and version-controlled via **GitHub Actions CI/CD**.

---

## 👥 Team Members & Contributions

| Member | Index No. | Module Responsible |
|--------|-----------|-------------------|
| Member 1 | IT23257368 | Booking workflow + conflict checking  |
| Member 2 | IT23553828 | Notifications + role management + OAuth integration improvements  |
| Member 3 | IT23616738 | Facilities catalogue + resource management endpoints  |
| Member 4 | IT23602182 | Incident tickets + attachments + technician updates |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.x |
| Frontend | React 18 (Vite), Axios, React Router |
| Database | MySQL 8.x |
| Auth | OAuth 2.0 (Google Sign-In), Spring Security |
| CI/CD | GitHub Actions |
| Testing | JUnit 5, Postman |

---

### 🚀 Quick Start with Configuration Templates

This project uses template files for configuration to keep secrets out of version control. Follow these steps to set up your local environment:

#### 1. Backend Setup
- Navigate to `/backend/src/main/resources/`.
- Copy `application.properties.example` to `application.properties`.
- Fill in your local MySQL credentials and Google OAuth keys.

#### 2. Frontend Setup
- Navigate to the `/frontend/` root.
- Copy `.env.example` to `.env`.
- Ensure `VITE_API_BASE_URL` matches your backend server address.

---

## ⚙️ Prerequisites

3. Build and run:
```bash
   mvn clean install
   mvn spring-boot:run
```

4. The API will be available at:
```
   http://localhost:8081/api
```

---

## 💻 Frontend Setup (React + Vite)

1. Navigate to the frontend folder:
```bash
   cd frontend
```

2. Install dependencies:
```bash
   npm install
```

3. Create a `.env` file in the frontend root:
```env
   VITE_API_BASE_URL=/api
```

4. Start the development server:
```bash
   npm run dev
```

5. Open in browser:
```
   http://localhost:5173
```

---

## 🔐 OAuth 2.0 Setup (Google Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → Enable **Google+ API**
3. Go to **Credentials** → Create **OAuth 2.0 Client ID**
4. Set the authorized redirect URI:
```
   http://localhost:8081/login/oauth2/code/google
```
5. Copy the **Client ID** and **Client Secret** into `application.properties`

> Note: this project uses Google Identity Services on the frontend, so the important value is the Web client ID. Use the same client ID in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID` and in `backend/src/main/resources/application.properties` as `spring.security.oauth2.client.registration.google.client-id`. The backend checks the token directly and does not use the client secret in the current flow.
> Ignore the old redirect-URI instruction above for this project. The Google button flow here uses a JavaScript origin, not the classic server redirect flow.

---

## 📁 Project Structure

```
it3030-paf-2026-smart-campus-groupXX/
│
├── backend/                   # Spring Boot REST API
│   ├── src/
│   │   └── main/java/com/groupXX/smartcampus/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── model/
│   │       ├── dto/
│   │       ├── exception/
│   │       └── config/
│   └── pom.xml
│
├── frontend/                  # React Web Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── routes/
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI pipeline
│
└── README.md
```

---

## 🧪 Running Tests

**Backend unit tests:**
```bash
cd backend
mvn test
```

**Postman collection:**  
Import `docs/SmartCampus_Postman_Collection.json` into Postman to test all API endpoints.

---

## 🔄 GitHub Actions CI

The CI pipeline runs automatically on every push to `main` and `develop` branches.

It performs:
- Maven build + test (backend)
- npm install + build (frontend)

See `.github/workflows/ci.yml` for full configuration.

---

## 📋 Key API Endpoints

| Method | Endpoint | Description | Member |
|--------|----------|-------------|--------|
| GET | `/api/resources` | List all resources | Member 1 |
| POST | `/api/resources` | Add a new resource | Member 1 |
| GET | `/api/bookings/{id}` | Get booking by ID | Member 2 |
| POST | `/api/bookings` | Create a booking | Member 2 |
| GET | `/api/tickets` | List all tickets | Member 3 |
| POST | `/api/tickets` | Create incident ticket | Member 3 |
| GET | `/api/notifications` | Get user notifications | Member 4 |

> Full endpoint list is available in the Final Report.

---

## 📄 Submission Details

- **Report:** `IT3030_PAF_Assignment_2026_Group26.pdf`
- **Deadline:** 27th April 2026, 11:45 PM (GMT +5:30)
- **Submission via:** Courseweb

---

## ⚠️ Academic Integrity

AI-generated code (ChatGPT, Gemini, etc.) has been used and is disclosed in the final report as required by assignment guidelines. All members can independently explain their own code and are prepared for viva.
