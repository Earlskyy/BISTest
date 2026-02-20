# Barangay Catarman Information System (BIS)

A full-stack web application for managing barangay operations including resident profiling, certificate issuance, blotter records, complaints, and announcements.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Validation**: Zod

## Project Structure

```
BISTest/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── households.js
│   │   ├── certificates.js
│   │   ├── blotter.js
│   │   ├── complaints.js
│   │   ├── announcements.js
│   │   ├── tags.js
│   │   ├── system.js
│   │   └── upload.js
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── schema.sql
│   ├── utils/
│   │   └── upload.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── staff/
│   │   ├── login/
│   │   ├── certificate-request/
│   │   ├── file-complaint/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   ├── lib/
│   ├── middleware.ts
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon account recommended)
- Cloudinary account (for file uploads)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `CLOUDINARY_*`: Your Cloudinary credentials

5. Run database migrations:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Admin Account

After running migrations, a default admin account is created:
- **Email**: `admin@barangaycatarman.gov.ph`
- **Password**: `admin123` (⚠️ **CHANGE THIS IN PRODUCTION**)

## Features

### Public Features (No Login Required)
- View announcements
- Request certificates
- File complaints

### Staff Features
- Manage households and family members
- Process certificate requests
- Manage blotter records
- Handle complaints
- Assign tags to residents
- Create announcements

### Admin Features
- Manage staff accounts
- View system logs
- Monitor system statistics
- Configure system settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset-password` - Reset password

### Households (Staff)
- `GET /api/households` - List households
- `POST /api/households` - Create household
- `GET /api/households/:id` - Get household details
- `PUT /api/households/:id` - Update household
- `DELETE /api/households/:id` - Delete household
- `POST /api/households/:id/members` - Add family member

### Certificates
- `POST /api/certificates/request` - Request certificate (public)
- `GET /api/certificates` - List requests (staff)
- `PUT /api/certificates/:id/status` - Update status (staff)

### Blotter (Staff)
- `GET /api/blotter` - List records
- `POST /api/blotter` - Create record
- `PUT /api/blotter/:id` - Update record
- `DELETE /api/blotter/:id` - Delete record

### Complaints
- `POST /api/complaints` - File complaint (public)
- `GET /api/complaints` - List complaints (staff)
- `PUT /api/complaints/:id/status` - Update status (staff)

### Announcements
- `GET /api/announcements` - List announcements (public)
- `POST /api/announcements` - Create announcement (staff)
- `PUT /api/announcements/:id` - Update announcement (staff)
- `DELETE /api/announcements/:id` - Delete announcement (staff)

### Tags (Staff)
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `POST /api/tags/assign` - Assign tag to resident
- `GET /api/tags/:tagId/residents` - Get residents by tag

### System (Admin)
- `GET /api/system/stats` - Get system statistics
- `GET /api/system/logs` - Get system logs

### Upload
- `POST /api/upload` - Upload image file

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting
- SQL injection prevention
- XSS protection
- Secure file uploads

## Production Deployment

1. Update all environment variables
2. Change default admin password
3. Set `NODE_ENV=production`
4. Use HTTPS
5. Configure proper CORS origins
6. Set up database backups
7. Configure Cloudinary for production
8. Build frontend: `npm run build`
9. Use a process manager like PM2 for the backend

## License

ISC
