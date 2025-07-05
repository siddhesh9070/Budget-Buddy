# Budget Buddy 💰

A smart and intuitive expense tracking and financial management application built with the MERN stack. Budget Buddy helps you track expenses, set budgets, and visualize your financial data with beautiful charts and real-time alerts.

## ✨ Features

### 📊 **Smart Dashboard**
- Real-time expense overview with beautiful charts
- Monthly spending trends and category distribution
- Budget progress tracking with visual indicators
- Quick stats and financial insights

### 💳 **Expense Management**
- Add, edit, and delete expenses with categories
- Advanced filtering and search capabilities
- Date-based expense tracking
- Bulk operations and data export

### 🎯 **Budget Management**
- Set budgets by category and time period
- Real-time budget alerts and notifications
- Visual progress bars and usage tracking
- Customizable alert thresholds

### 👤 **User Profile**
- Personal information management
- Currency preferences (INR, USD, EUR, GBP, CAD, AUD)
- Password change with security validation
- Notification settings customization

### 🔐 **Security & Authentication**
- JWT-based secure authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Session management

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Recharts** - Beautiful data visualization
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-buddy
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/budget-buddy
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the application**
   ```bash
   # Start backend (from root directory)
   npm run dev
   
   # Start frontend (from client directory)
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### Getting Started
1. **Register** a new account or **Sign In** to existing account
2. **Set your monthly budget** and preferred currency
3. **Add your first expense** to start tracking
4. **Create budgets** for different categories
5. **Monitor your spending** through the dashboard

### Key Features
- **Dashboard**: View your financial overview with charts and stats
- **Expenses**: Add and manage your daily expenses
- **Budgets**: Set spending limits and get alerts
- **Profile**: Manage your account settings and preferences

## 🎨 UI/UX Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Beautiful color schemes
- **Real-time Updates**: Instant feedback and notifications
- **Intuitive Navigation**: Easy-to-use interface
- **Accessibility**: WCAG compliant design

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/alerts/check` - Check budget alerts

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)
```bash
# Build the application
cd client
npm run build

# Deploy the build folder
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lucide React** for beautiful icons
- **Recharts** for amazing data visualization
- **Tailwind CSS** for the utility-first styling
- **React Hook Form** for efficient form handling

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Budget Buddy** - Your smart financial companion! 💰✨ 