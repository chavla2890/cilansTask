# cilansTask

## Overview

This project is a **User Management API** built using **Node.js, Express.js, PostgreSQL, JWT authentication, and Redis caching**. It allows users to register, log in, manage their profiles, and receive email notifications. The API is optimized for performance and security.

## Features

- **User Registration** with password hashing and email notifications
- **JWT-based Authentication** for secure access
- **Profile Management** (view and update user details)
- **User Listing** with pagination and Redis caching
- **Rate Limiting** for login attempts using Redis
- **Secure Password Storage** with bcrypt
- **Environment Configuration** using dotenv
- **Input Validation** for security

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Caching & Rate Limiting**: Redis
- **Email Service**: Nodemailer
- **Security**: Helmet, bcrypt
- **Testing**: Postman

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/chavla2890/cilansTask.git
cd cilansTask
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/userdb
JWT_SECRET=your_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### 4. Setup PostgreSQL Database

Run the following SQL command to create the users table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start Redis Server

Ensure Redis is running locally:

```bash
redis-server
```

### 6. Start the API Server

```bash
npm start
```

## API Endpoints

### Authentication

#### **Register a New User**

**POST** `/api/register`
**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": { "id": 1, "email": "user@example.com", "name": "John Doe" }
}
```

#### **User Login**

**POST** `/api/login`
**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "token": "your_jwt_token_here"
}
```

### User Management

#### **Get All Users (Paginated & Cached)**

**GET** `/api/users?page=1&limit=10`
**Headers:**

```json
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

#### **Get User Profile**

**GET** `/api/profile`
**Headers:**

```json
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

#### **Update User Profile**

**PUT** `/api/profile`
**Headers:**

```json
{
  "Authorization": "Bearer your_jwt_token_here"
}
```

**Request Body:**

```json
{
  "name": "New Name"
}
```

## Security & Performance Enhancements

- **JWT authentication middleware** to protect routes
- **Rate-limiting middleware** for login attempts
- **Input validation** for all endpoints
- **Redis caching** for user listings

