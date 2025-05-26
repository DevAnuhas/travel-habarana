# Travel Habarana - Safari Booking Web Application

## Overview

Travel Habarana is a Next.js 15 web application designed to promote and manage safari and village tour bookings in Sri Lanka. The platform allows users to browse safari packages (Hurulu Eco Park, Minneriya National Park, Kaudulla National Park) and a village tour, submit booking inquiries, and receive follow-up from the client. A secure admin panel enables authorized admins to manage packages, inquiries, and admin users. The application uses MongoDB for data storage, Auth.js for authentication, and Tailwind CSS and Shadcn UI for styling.

## Features

- **User Side**: Browse safari and village tour packages, submit booking inquiries (no sign-up required), and access contact details.
- **Admin Panel**: Manage packages (CRUD operations), view and delete inquiries, and add/remove admin users.
- **Authentication**: Email and password login for admins with JWT session management and password change functionality.
- **Error Handling**: Centralized error handling for API routes with custom error classes.

## Tech Stack

- **Framework**: Next.js 15
- **Database**: MongoDB (via Mongoose)
- **Image Storage**: Cloudinary
- **Authentication**: Auth.js (NextAuth.js)
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Hosting**: Recommended deployment on Vercel

## Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas account (for cloud database)
- Cloudinary account (for cloud image storage)
- Gmail account (for email notifications)
- Vercel account (for deployment)

## Installation

1. **Clone the Repository**:

   ```bash
   https://github.com/DevAnuhas/travel-habarana.git
   cd travel-habarana
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   - Create a `.env.local` file in the root directory and add the following:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/travelHabaranaDB?retryWrites=true&w=majority
   CLOUDINARY_URL=CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>
   NEXTAUTH_SECRET=<your-nextauth-secret>
   EMAIL_USER=<your-email@example.com>
   EMAIL_PASSWORD=<your-email-password>
   ```

   - Update `MONGODB_URI` with your MongoDB Atlas connection string.
   - Update `CLOUDINARY_URL` with your Cloudinary connection string.
   - Generate a `NEXTAUTH_SECRET` using `openssl rand -base64 32` or an online generator.

4. **Set Up MongoDB Atlas**:

   - Create a cluster in MongoDB Atlas.
   - Add your IP address to the network access list.
   - Create a database user and use `travelHabaranaDB` as the database name.

5. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   - Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- **`app/`**: Next.js app directory with pages and API routes.
  - `api/`: Backend API routes (e.g., `packages`, `inquiries`, `auth`).
  - `admin/`: Admin panel pages (e.g., `login`, `dashboard`, `packages`).
- **`lib/`**: Utility and model files.
  - `mongodb.ts`: Singleton MongoDB connection.
  - `models/`: Mongoose schemas.
  - `errors.ts`: Custom error classes.
- **`middleware/error-handler.ts`**: Error handling middleware.
- **`middleware.ts`**: Authentication middleware for protected routes.
- **`components/`**: React components for the UI.

## Usage

### User Side

- Visit the homepage to browse packages.
- Click "Book Now" to submit an inquiry via a form (data is emailed to your email and stored in MongoDB).

### Admin Panel

1. **Sign In**:
   - Go to `/admin/login` and log in with an admin email and password.
2. **Dashboard**:
   - View an overview of recent inquiries and packages at `/admin/dashboard`.
3. **Packages Management**:
   - Manage packages (create, edit, delete) at `/admin/packages`.
4. **Inquiries Management**:
   - View and delete inquiries at `/admin/inquiries` with filters for package and date.
5. **Admin Management**:
   - Add or remove users at `/admin/users`.
6. **Change Password**:
   - Update your password at `/admin/change-password`.

## API Endpoints

### Packages

- `GET /api/packages`: List all packages.
- `GET /api/packages/[id]`: Get a package by ID.
- `POST /api/packages`: Create a package (admin-only).
- `PUT /api/packages/[id]`: Update a package (admin-only).
- `DELETE /api/packages/[id]`: Delete a package (admin-only).

### Inquiries

- `POST /api/inquiries`: Submit a booking inquiry.
- `GET /api/inquiries`: List inquiries (admin-only).
- `GET /api/inquiries/[id]`: Get an inquiry by ID (admin-only).
- `DELETE /api/inquiries/[id]`: Delete an inquiry (admin-only).
- `POST /api/inquiries/status`: Bulk update inquiry status (admin-only).

### Auth

- `POST /api/auth/register`: Add a new admin (admin-only).
- `GET /api/auth/users`: List all users (admin-only).
- `PATCH /api/auth/users/[id]`: Change password (admin-only).
- `DELETE /api/auth/users/[id]`: Delete user (admin-only).
- `POST /api/auth/forgot-password`: Send a password reset email.
- `POST /api/auth/reset-password`: Reset password using a token.

### Cloudinary

- `GET /api/cloudinary`: Get a signed URL for an image upload (admin-only).

## Deployment

This application can be easily deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDevAnuhas%2Ftravel-habarana.git)

## License

This project is licensed under the [MIT License](License.txt).
