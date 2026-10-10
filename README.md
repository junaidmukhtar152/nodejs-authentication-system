# 🔐 Node.js Authentication System

<p align="center">
  A professional authentication backend built with Node.js, Express.js, and MongoDB.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-Framework-black?logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/JWT-Authentication-purple?logo=jsonwebtokens" alt="JWT">
  <img src="https://img.shields.io/badge/Status-Completed-success" alt="Status">
</p>

---

## 📌 Overview

This project is a RESTful authentication API designed to manage user accounts and protect application resources.

It includes user registration, email verification, password management, JWT authentication, refresh-token rotation, and role-based access control.

It was developed as a practical backend project to strengthen my skills in Node.js, Express.js, MongoDB, and API security.

## ✨ Features

- **User Registration:** Create accounts with validated user information.
- **Password Security:** Hash passwords using bcrypt.
- **Email Verification:** Verify registered email addresses.
- **JWT Authentication:** Generate short-lived access tokens.
- **Refresh Tokens:** Store hashed refresh tokens and rotate them.
- **Protected Routes:** Authenticate users before accessing protected resources.
- **Role-Based Access:** Restrict user-management access to administrators.
- **Change Password:** Update an existing account password.
- **Forgot Password:** Request a password-reset token.
- **Reset Password:** Reset passwords using valid tokens.
- **Logout:** Revoke refresh tokens.
- **Input Validation:** Validate registration and login requests.

## 🛠️ Tech Stack

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| Node.js        | JavaScript runtime          |
| Express.js     | Backend framework           |
| MongoDB        | Database                    |
| Mongoose       | Database modeling           |
| bcrypt         | Password hashing            |
| JSON Web Token | Access-token authentication |
| dotenv         | Environment configuration   |
| Postman        | API testing                 |

## 📁 Project Structure

```text
AUTH-SYSTEM/
├── config/
│   └── db.js
├── controllers/
│   └── authController.js
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   └── authValidation.js
├── models/
│   ├── User.js
│   └── RefreshToken.js
├── routes/
│   └── authRoutes.js
├── scripts/
│   └── makeAdmin.js
├── utils/
│   ├── generateToken.js
│   ├── generateRefreshToken.js
│   ├── generateVerificationToken.js
│   └── generateResetToken.js
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

_Note: The structure above illustrates the main files. Your actual filenames may differ._

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)
- [Postman](https://www.postman.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/junaidmukhtar152/nodejs-authentication-system
```

### 2. Open the Project

```bash
cd nodejs-authentication-system
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/auth_system
JWT_SECRET=replace_with_a_strong_random_secret
```

Use your own strong secret. Never commit your `.env` file.

### 5. Start the Server

```bash
node server.js
```

Open the following URL to check the server:

`http://localhost:5000`

Expected response:

```text
Authentication Server is Running
```

## 🔗 API Endpoints

**Base URL:** `http://localhost:5000/api/auth`

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| POST   | `/register`            | Register a new user              |
| POST   | `/verify-email`        | Verify email address             |
| POST   | `/resend-verification` | Request a new verification token |
| POST   | `/login`               | Log in                           |
| GET    | `/profile`             | Get authenticated user profile   |
| GET    | `/users`               | List users (admin only)          |
| PATCH  | `/change-password`     | Change password                  |
| POST   | `/forgot-password`     | Request password reset           |
| POST   | `/reset-password`      | Reset password                   |
| POST   | `/refresh-token`       | Rotate refresh token             |
| POST   | `/logout`              | Revoke refresh token             |

Protected endpoints require the appropriate Bearer access token, except where the route does not require authentication.

## 🧪 Testing

The API was tested using Postman.

Main workflows tested:

- Registration and email verification
- Login and profile access
- Password change
- Forgot-password and reset-password workflows
- Refresh-token rotation
- Admin-only user listing
- Logout and refresh-token revocation

## 🔒 Security Notes

- Passwords are hashed before storage.
- Refresh tokens are stored as hashes.
- Access tokens are short-lived.
- Environment variables and secrets must remain private.
- Email verification and password-reset tokens are returned in development responses; a real email service is needed for production use.
- Logout revokes refresh tokens. Existing access tokens may remain valid until they expire.
- Production deployment requires a strong secret, secure HTTPS configuration, and appropriate security settings.

## 👨‍💻 Author

**Junaid Mukhtar**

BS Software Engineering Student | Backend & Full-Stack Web Development

- GitHub: [junaidmukhtar152](https://github.com/junaidmukhtar152)

---

<p align="center">
  Built with 💚 using Node.js, Express.js, and MongoDB.
</p>
