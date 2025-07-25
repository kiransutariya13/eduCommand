# Bhavnagar School Monitoring System

A comprehensive web application for monitoring and managing schools under Bhavnagar Municipal Corporation. The system allows administrators and teachers to upload activities, circulars, and reports with file attachments.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control** (Admin & Teacher)
- **JWT-based authentication**
- **Secure login/logout system**

### 📊 Dashboard
- **Real-time statistics** for schools, users, activities, circulars, and reports
- **Quick action buttons** for easy navigation
- **Role-specific dashboard views**

### 🎯 Activity Management
- **Upload activities with multiple images** (up to 5 images per activity)
- **Image preview and gallery view**
- **Filter activities by school, date, and search terms**
- **Download individual images**

### 📄 Circular Management
- **Create and manage official circulars**
- **PDF attachment support** (up to 10MB)
- **Priority levels** (Low, Medium, High, Urgent)
- **Filter by priority, date, and search terms**

### 📈 Report Management
- **Upload various types of reports** (Monthly, Quarterly, Annual, Academic, Attendance, Performance)
- **PDF attachment support** (up to 10MB)
- **Status tracking** (Draft, Review, Published)
- **Filter by type, status, school, and search terms**

### 🏫 School Management (Admin Only)
- **Add and manage schools**
- **Track school statistics** (students, teachers)
- **School information management**

### 👥 User Management (Admin Only)
- **View all system users**
- **Role-based user display**
- **User registration and management**

## Technology Stack

### Frontend
- **React.js 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bhavnagar-school-monitoring
   \`\`\`

2. **Install backend dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the `.env` file with your configuration:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/bhavnagar-schools
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   \`\`\`

4. **Seed the database**
   \`\`\`bash
   npm run seed
   \`\`\`

5. **Start the backend server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. **Install frontend dependencies**
   \`\`\`bash
   cd ..  # Go back to root directory
   npm install
   \`\`\`

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   \`\`\`env
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

3. **Start the frontend development server**
   \`\`\`bash
   npm start
   \`\`\`

## Running in VS Code

### Method 1: Using VS Code Terminal

1. **Open the project in VS Code**
   \`\`\`bash
   code .
   \`\`\`

2. **Open two terminal windows** (Terminal → New Terminal)

3. **In Terminal 1 (Backend):**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

4. **In Terminal 2 (Frontend):**
   \`\`\`bash
   npm start
   \`\`\`

### Method 2: Using VS Code Tasks

1. **Create `.vscode/tasks.json`:**
   \`\`\`json
   {
     "version": "2.0.0",
     "tasks": [
       {
         "label": "Start Backend",
         "type": "shell",
         "command": "npm",
         "args": ["run", "dev"],
         "options": {
           "cwd": "${workspaceFolder}/backend"
         },
         "group": "build",
         "presentation": {
           "echo": true,
           "reveal": "always",
           "focus": false,
           "panel": "new"
         }
       },
       {
         "label": "Start Frontend",
         "type": "shell",
         "command": "npm",
         "args": ["start"],
         "group": "build",
         "presentation": {
           "echo": true,
           "reveal": "always",
           "focus": false,
           "panel": "new"
         }
       },
       {
         "label": "Start Full Stack",
         "dependsOrder": "parallel",
         "dependsOn": ["Start Backend", "Start Frontend"]
       }
     ]
   }
   \`\`\`

2. **Run the task:** Press `Ctrl+Shift+P`, type "Tasks: Run Task", and select "Start Full Stack"

## Default Login Credentials

After seeding the database, use these credentials:

### Administrator
- **Email:** admin@bhavnagar.gov.in
- **Password:** admin123

### Teacher
- **Email:** meera.patel@bhavnagar.gov.in
- **Password:** teacher123

## File Upload Specifications

### Images (Activities)
- **Supported formats:** JPG, PNG, GIF
- **Maximum size:** 5MB per image
- **Maximum count:** 5 images per activity
- **Storage location:** `backend/uploads/activities/`

### PDFs (Circulars & Reports)
- **Supported format:** PDF only
- **Maximum size:** 10MB per file
- **Storage locations:** 
  - Circulars: `backend/uploads/circulars/`
  - Reports: `backend/uploads/reports/`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Schools
- `GET /api/schools` - Get all schools
- `POST /api/schools` - Create new school (Admin only)

### Activities
- `GET /api/activities` - Get activities
- `POST /api/activities` - Upload activity with images

### Circulars
- `GET /api/circulars` - Get all circulars
- `POST /api/circulars` - Create circular with PDF

### Reports
- `GET /api/reports` - Get reports
- `POST /api/reports` - Upload report with PDF

### File Downloads
- `GET /api/download/activity-image/:activityId/:imageId` - Download activity image
- `GET /api/download/circular-pdf/:circularId` - Download circular PDF
- `GET /api/download/report-pdf/:reportId` - Download report PDF

## Project Structure

\`\`\`
bhavnagar-school-monitoring/
├── backend/
│   ├── server.js              # Main server file
│   ├── scripts/
│   │   └── seed.js           # Database seeding script
│   ├── uploads/              # File upload directory
│   │   ├── activities/       # Activity images
│   │   ├── circulars/        # Circular PDFs
│   │   └── reports/          # Report PDFs
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── DashboardLayout.js
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ToastContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Dashboard.js
│   │   ├── Upload.js
│   │   ├── Activities.js
│   │   ├── Circulars.js
│   │   ├── Reports.js
│   │   ├── Schools.js
│   │   └── Users.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
\`\`\`

## Features by Role

### Administrator
- ✅ View all schools, users, activities, circulars, and reports
- ✅ Add new schools and manage school information
- ✅ View all system users
- ✅ Upload activities for any school
- ✅ Create circulars for all schools
- ✅ Upload reports for any school
- ✅ Access to complete dashboard statistics

### Teacher
- ✅ View activities from their assigned school
- ✅ Upload activities for their school only
- ✅ View all circulars
- ✅ Upload reports for their school only
- ✅ Access to school-specific dashboard statistics

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **File Type Validation** - Strict file type checking for uploads
- **File Size Limits** - Prevents large file uploads
- **Role-based Access Control** - Different permissions for admin and teacher roles
- **Input Validation** - Server-side validation for all inputs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the Bhavnagar Municipal Corporation IT Department.

---

**Bhavnagar Municipal Corporation**  
School Monitoring System v1.0.0
