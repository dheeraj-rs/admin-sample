# D-Admin Dashboard

<p align="center">
  <img src="https://via.placeholder.com/1200x600" alt="D-Admin Dashboard" width="100%" />
</p>

A professional-grade admin dashboard built with Next.js 15, React 19, and TypeScript. Designed for enterprise applications, D-Admin provides a comprehensive suite of tools and components for building scalable, high-performance administrative interfaces with modern UI/UX principles.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.0-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## ✨ Key Features

### 🎯 Core Features
- **App Router Architecture** - Built on Next.js 15's latest App Router for optimal performance
- **TypeScript Integration** - Complete type safety throughout the codebase
- **Responsive Design** - Flawlessly adapts to any device or screen size
- **Authentication System** - Secure, role-based access control with multiple auth providers
- **Dark/Light Modes** - Multiple theme options with seamless transitions

### 📊 Dashboard & Analytics
- **Interactive Analytics** - Real-time data visualization with customizable widgets
- **Performance Metrics** - CPU, memory, and network performance monitoring
- **User Activity Tracking** - Comprehensive user behavior analytics
- **Data Export** - Export reports in multiple formats (CSV, Excel, PDF)

### 💼 Business Features
- **CRUD Operations** - Complete create, read, update, and delete functionality
- **File Management** - Drag-and-drop file uploads with preview capabilities
- **Advanced Search** - Full-text search with filters and sorting options
- **Notifications System** - Real-time alerts and notification center
- **User Management** - Comprehensive user and role management

### 🛠️ Developer Tools
- **Reusable Components** - Extensive library of pre-built, customizable components
- **API Integration** - Seamless integration with RESTful and GraphQL APIs
- **Form Builder** - Dynamic form creation with validation
- **Code Splitting** - Optimized bundle sizes for faster loading
- **Testing Suite** - Comprehensive unit and integration tests

## 🖥️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.0, React 19.0.0
- **State Management**: React Context API
- **Data Fetching**: TanStack React Query 5.66.9
- **Styling**: SASS/SCSS with CSS Modules
- **Icons**: Lucide React
- **Charts**: Chart.js 4.2.1, D3.js
- **Type Safety**: TypeScript 5

### Backend
- **Database**: MongoDB with Mongoose 8.9.0
- **Authentication**: NextAuth.js with JWT
- **API**: Next.js API Routes (REST) / GraphQL
- **Validation**: Zod
- **File Storage**: AWS S3 / Local Storage

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, Prettier
- **Deployment**: Vercel / Docker

## 📸 Screenshots

<table>
  <tr>
    <td><img src="https://via.placeholder.com/400x300" alt="Dashboard" /></td>
    <td><img src="https://via.placeholder.com/400x300" alt="Analytics" /></td>
  </tr>
  <tr>
    <td><img src="https://via.placeholder.com/400x300" alt="User Management" /></td>
    <td><img src="https://via.placeholder.com/400x300" alt="Dark Mode" /></td>
  </tr>
</table>

## 🚀 Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm, yarn, pnpm, or bun package manager
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dheeraj-rs/d-admin.git
cd d-admin
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory with the following variables:
```
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# File Storage (optional)
AWS_S3_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Access the dashboard**
Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 📂 Project Structure

```
d-admin/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── users/            # User management endpoints
│   │   └── [...]            
│   ├── (auth)/               # Authentication pages (login, register)
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── analytics/        # Analytics pages
│   │   ├── users/            # User management pages
│   │   ├── settings/         # Settings pages
│   │   └── [...]
│   └── layout.tsx            # Root layout
├── components/               # Reusable components
│   ├── ui/                   # UI components (buttons, inputs, etc.)
│   ├── charts/               # Chart components
│   ├── forms/                # Form components
│   ├── tables/               # Table components
│   ├── TabView/              # Tab component
│   └── [...]
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useDarkMode.ts        # Theme hook
│   └── [...]
├── layout/                   # Layout components
│   ├── AppMenubar.tsx        # Sidebar menu
│   ├── AppTopbar.tsx         # Top navigation
│   ├── AppBottombar.tsx      # Mobile bottom navigation
│   └── [...]
├── lib/                      # Utility functions
│   ├── dbConnect.ts          # MongoDB connection
│   ├── api.ts                # API utility functions
│   └── [...]
├── models/                   # Mongoose models
│   ├── User.ts               # User model
│   ├── Item.ts               # Item model
│   └── [...]
├── public/                   # Static assets
│   ├── images/               # Images
│   ├── icons/                # Icons
│   └── demo/                 # Demo data
├── styles/                   # Global styles
│   ├── globals.scss          # Global styles
│   ├── variables.scss        # SCSS variables
│   └── [...]
├── types/                    # TypeScript type definitions
│   ├── user.ts               # User types
│   ├── auth.ts               # Auth types
│   └── [...]
├── utils/                    # Utility functions
│   ├── formatters.ts         # Data formatters
│   ├── validators.ts         # Validation functions
│   └── [...]
├── middleware.ts             # Next.js middleware
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── [...]
```

## 🛠️ Development

### Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Format code**: `npm run format`

### Customization

#### Theming
1. Modify the theme variables in `styles/variables.scss`
2. Create custom theme files in `styles/themes/`
3. Add theme options in the `ThemeProvider` component

#### Adding New Features
1. Create new components in the `components/` directory
2. Add new pages in the `app/` directory
3. Create new API endpoints in the `app/api/` directory
4. Update types in the `types/` directory

## 📊 Performance Optimization

D-Admin is built with performance in mind:

- **Server Components**: Utilizing Next.js 13+ server components for improved rendering
- **Dynamic Imports**: Code splitting to reduce initial load time
- **Image Optimization**: Automatic image optimization with Next.js Image component
- **Edge Runtime**: Deployment on the edge for faster response times
- **Incremental Static Regeneration**: For faster page loads with dynamic content
- **API Route Segmentation**: Optimized API routes for better performance

## 🔒 Security Features

- **CSRF Protection**: Built-in protection against cross-site request forgery
- **Content Security Policy**: Configured to prevent XSS attacks
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks
- **Role-Based Access Control**: Granular permissions based on user roles
- **Audit Logging**: Comprehensive logging of user actions

## 📦 Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Docker Deployment

1. Build the Docker image
```bash
docker build -t d-admin .
```

2. Run the Docker container
```bash
docker run -p 3000:3000 d-admin
```

## 📈 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes between versions.

## 🤝 Contributing

We welcome contributions to D-Admin! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [React Documentation](https://react.dev/) - learn about React
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - learn about TypeScript
- [MongoDB Documentation](https://docs.mongodb.com/) - learn about MongoDB
- [Mongoose Documentation](https://mongoosejs.com/docs/) - learn about Mongoose
- [TanStack Query Documentation](https://tanstack.com/query/latest) - learn about React Query

## 🌟 Support

If you find D-Admin useful, please consider giving it a star on GitHub! Your support helps us continue to improve and maintain this project.

<!-- new installed  -->
@reduxjs/toolkit
framer-motion
react-hot-toast
react-icons
react-redux
react-syntax-highlighter
@svgr/webpack
@types/react-syntax-highlighter
---

<p align="center">
  Developed with ❤️ by <a href="https://github.com/dheeraj-rs">Dheeraj RS</a>
</p># admin-sample
