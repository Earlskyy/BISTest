# Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL Database** (Neon account recommended: https://neon.tech)
3. **Cloudinary Account** (for file uploads: https://cloudinary.com)

## Step-by-Step Setup

### 1. Database Setup

1. Create a Neon PostgreSQL database (or use your own PostgreSQL instance)
2. Copy the connection string (it will look like: `postgresql://user:password@host/database`)

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAX_FILE_SIZE=5242880
FRONTEND_URL=http://localhost:3000
```

Run migrations:
```bash
npm run migrate
```

Start backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Default Login

After running migrations, you can login with:
- **Email**: `admin@barangaycatarman.gov.ph`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately in production!

## Testing the System

1. **Public Pages** (No login required):
   - Visit `http://localhost:3000` - Landing page
   - Request a certificate
   - File a complaint
   - View announcements

2. **Staff Login**:
   - Login at `http://localhost:3000/login`
   - Access staff dashboard
   - Manage households, certificates, blotter, etc.

3. **Admin Login**:
   - Use the default admin account
   - Manage staff accounts
   - View system logs

## Common Issues

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible
- Check if SSL is required (Neon requires SSL)

### Cloudinary Upload Fails
- Verify your Cloudinary credentials
- Check if your account is active
- Ensure the API keys have upload permissions

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### JWT Errors
- Ensure `JWT_SECRET` is set and is at least 32 characters
- Clear browser cookies if authentication issues persist

## Run Certificate Migration (if you have existing data)

If you created certificate requests before the reference number feature, run:

```bash
cd backend
npm run migrate:certs
```

## Run Certificate Templates Migration

To enable staff-managed certificate templates, run:

```bash
cd backend
npm run migrate:templates
```

## Next Steps

1. **Change Default Admin Password**:
   - Login as admin
   - Use the password reset feature (or update directly in database)

2. **Create Staff Accounts**:
   - Admin can create staff accounts via Admin Dashboard

3. **Configure Cloudinary**:
   - Set up upload presets
   - Configure image transformations if needed

4. **Production Deployment**:
   - Update all environment variables
   - Use HTTPS
   - Set up proper database backups
   - Configure production Cloudinary settings

## Project Structure

- `backend/` - Express.js API server
- `frontend/` - Next.js application
- `backend/scripts/schema.sql` - Database schema
- `README.md` - Full documentation

## Support

For issues or questions, refer to the main `README.md` file.
