# Travel Habarana - Safari Booking Web Application

## Overview

Travel Habarana is a Next.js 15 web application designed to promote and manage safari and village tour bookings in Sri Lanka. The platform allows users to browse safari packages (Hurulu Eco Park, Minneriya National Park, Kaudulla National Park) and a village tour, submit booking inquiries, and receive follow-up from the client. The application features a rich blog section powered by Sanity CMS, allowing admins to create and manage content easily. A secure admin panel enables authorized admins to manage packages, inquiries, blog content, and admin users. The application uses MongoDB for data storage, Sanity for content management, Auth.js for authentication, and Tailwind CSS and Shadcn UI for styling.

## Features

- **User Side**: Browse safari and village tour packages, submit booking inquiries (no sign-up required), read blog articles with comments functionality, and access contact details.
- **Admin Panel**: Manage packages (CRUD operations), view and delete inquiries, create and edit blog content with Sanity Studio, and add/remove admin users.
- **Blog System**: Feature and categorize blog posts, rich text editing with block content, author management, comment moderation, and image optimization.
- **Authentication**: Email and password login for admins with JWT session management and password change/reset functionality.
- **Error Handling**: Centralized error handling for API routes with custom error classes.

## Tech Stack

- **Framework**: Next.js 15
- **Database**: MongoDB (via Mongoose)
- **CMS**: Sanity.io (for blog content)
- **Image Storage**: Cloudinary, Sanity Asset Pipeline
- **Authentication**: Auth.js (NextAuth.js)
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Hosting**: Recommended deployment on Vercel

## Prerequisites

- Node.js (v18 or later)
- MongoDB Atlas account (for cloud database)
- Sanity.io account (for blog content management)
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
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database-name>?retryWrites=true&w=majority

   # Authentication
   NEXTAUTH_SECRET=<your-nextauth-secret>

   # Image Storage
   CLOUDINARY_URL=cloudinary://<your-api-key>:<your-api-secret>@<your-cloud-name>

   # Email
   EMAIL_USER=<your-email@example.com>
   EMAIL_PASSWORD=<your-email-password>

   # Sanity
   NEXT_PUBLIC_SANITY_PROJECT_ID=<your-sanity-project-id>
   NEXT_PUBLIC_SANITY_DATASET=<your-sanity-dataset>
   SANITY_API_TOKEN=<your-sanity-api-token>
   SANITY_WEBHOOK_SECRET=<your-sanity-webhook-secret>
   ```

   - Update `MONGODB_URI` with your MongoDB Atlas connection string.
   - Update `CLOUDINARY_URL` with your Cloudinary API key and API secret.
   - Generate `NEXTAUTH_SECRET` and `SANITY_WEBHOOK_SECRET` using `openssl rand -base64 32` or an online generator.
   - Update `EMAIL_USER` and `EMAIL_PASSWORD` with your SMTP server credentials.
   - Configure Sanity environment variables with your project credentials.

4. **Seed the Database**:

   - Run the `npm run seed` command to seed the database with sample data.
   - Console output will show the admin user's login credentials.

5. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   - Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- **`app/`**: Next.js app directory with pages and API routes.
  - `api/`: Backend API routes (e.g., `packages`, `inquiries`, `auth`).
  - `(main)/`: Main pages for browsing packages, inquiring, and viewing blog posts.
  - `admin/`: Admin panel pages (e.g., `login`, `dashboard`, `packages`, `blogs`).
- **`lib/`**: Utility and model files.
  - `mongodb.ts`: Singleton MongoDB connection.
  - `models/`: Mongoose schemas.
  - `errors.ts`: Custom error classes.
- **`sanity/`**: Sanity CMS configuration.
  - `schemaTypes/`: Schema definitions for blog content types.
  - `queries.ts`: GROQ queries for fetching blog content.
  - `lib/`: Sanity client utilities.
- **`middleware/error-handler.ts`**: Error handling middleware.
- **`middleware.ts`**: Authentication middleware for protected routes.
- **`components/`**: React components for the UI.

## Usage

### User Side

- Visit the homepage to browse packages.
- Click "Book Now" to submit an inquiry via a form (data is emailed to your email and stored in MongoDB).
- Browse blog articles at `/blogs` with filtering by categories.
- Read individual blog posts and leave comments (requires moderation).

### Admin Panel

1. **Sign In**:
   - Go to `/admin/login` and log in with an admin email and password.
2. **Dashboard**:
   - View an overview of recent inquiries and packages at `/admin/dashboard`.
3. **Inquiries Management**:
   - View and delete inquiries at `/admin/inquiries` with filters for package and date.
4. **Packages Management**:
   - Manage packages (create, edit, delete) at `/admin/packages`.
5. **Blog Management**:
   - Create and edit blog posts at `/admin/blogs` using Sanity Studio.
   - Manage blog categories, authors, and moderate comments.
6. **Users Management**:
   - Add or remove users at `/admin/users`.
7. **Change Password**:
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
- `POST /api/auth/verify-reset-token`: Verify a password reset token.

### Cloudinary

- `GET /api/cloudinary`: Get a signed URL for an image upload (admin-only).

### Blog Comments

- `POST /api/create-comment`: Submit a comment on a blog post (requires moderation).

### Sanity Revalidation

- `POST /api/revalidate`: Revalidate specific pages when content changes in Sanity.

## Sanity Blog Setup

The blog functionality is powered by Sanity.io, a headless CMS that provides a structured content backend with a customizable editing interface.

### Sanity Configuration

- **Studio Setup**: The Sanity Studio is embedded directly in the Next.js app at `/admin/blogs`.
- **Content Structure**:
  - `Post`: Blog post with title, slug, author, main image, categories, publish date, excerpt, and body content.
  - `Author`: Information about post writers including name, bio, and image.
  - `Category`: Content categories for organizing blog posts.
  - `Comment`: User-submitted comments with moderation support.

### Content Management

1. **Creating Blog Posts**:

   - Navigate to `/admin/blogs` and log in with admin credentials.
   - Use the Sanity Studio interface to create, edit, and delete blog posts.
   - Rich text editing with block content, images, and formatting options.

2. **Content Moderation**:

   - Comments require approval before being displayed.
   - Moderate comments through the Sanity Studio interface.

3. **Blog Features**:
   - Featured posts highlighted on the homepage.
   - Category-based filtering.
   - Related posts recommendations.
   - Responsive image handling with art direction.

## Blog Functionality

The blog functionality enhances the travel website by providing valuable content for visitors, improving SEO, and building trust with potential customers through informative articles about the safari experiences and local attractions.

### User Features

- **Blog Listing**: Browse all blog posts with pagination and filtering by categories.
- **Search**: Real-time search functionality to find specific blog posts.
- **Featured Posts**: Highlighted blog posts displayed on the homepage.
- **Category Filtering**: Filter blog posts by different categories.
- **Reading Experience**: Clean and responsive layout for optimal reading on all devices.
- **Comments**: Submit comments on blog posts (requires admin approval).
- **Social Sharing**: Share blog posts on social media platforms.
- **Related Content**: Discover related blog posts at the end of each article.

### Admin Features

- **Embedded Studio**: Sanity Studio embedded directly in the admin panel at `/admin/blogs`.
- **Content Creation**: Rich text editor with formatting options, images, and embeds.
- **Content Organization**: Categorize posts and manage authors.
- **Featured Posts**: Mark posts to appear in the featured section on the homepage.
- **Comment Moderation**: Review and approve/reject user comments.
- **Content Preview**: Preview posts before publishing.
- **Image Management**: Upload and manage images with the Sanity Asset Pipeline.
- **Publishing Control**: Schedule posts for future publishing.

### Technical Implementation

- **Content Schema**:

  - Posts with title, slug, author, image, categories, publish date, excerpt, and body content.
  - Authors with name, bio, and image.
  - Categories for organizing content.
  - Comments with moderation workflow.

- **Performance Optimizations**:
  - Responsive image handling with art direction.
  - Pagination for efficient loading of blog posts.
  - Client-side filtering for quick category browsing.
  - Real-time content updates with minimal revalidation.

## Sanity Setup Instructions

To set up Sanity for the blog functionality, follow these instructions:

### Adding Initial Content

1. **Navigate to the Studio**:

   Access the Sanity Studio at `/admin/blogs` after logging in as an admin.

2. **Create Categories**:

   Add categories like "Safari Tips", "Wildlife", "Local Culture", etc.

3. **Add Authors**:

   Create author profiles with names, bios, and images.

4. **Create Blog Posts**:

   Create your first blog posts with:

   - Title
   - Slug (auto-generated from title)
   - Main image
   - Categories
   - Author reference
   - Publish date
   - Excerpt
   - Body content using the rich text editor

5. **Feature Posts**:

   Mark posts as featured to display them on the homepage by checking the "Featured" checkbox.

### Content Management Tips

- **Images**: For best results, use images with a 16:9 aspect ratio for blog thumbnails.
- **Excerpts**: Keep excerpts concise (150-200 characters) for optimal display in listings.
- **Categories**: Use consistent categories to improve content organization.
- **Comments**: Check the studio regularly for new comments that need moderation.

## Deployment

This application can be easily deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDevAnuhas%2Ftravel-habarana.git)

## License

This project is licensed under the [MIT License](License.txt).
