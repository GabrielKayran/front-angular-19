# 🍺 Ambev E-commerce Frontend

> Modern e-commerce system built with Angular 19, Angular Material, and Bootstrap

## 📋 About the Project

This is a complete e-commerce system developed for Ambev, offering a modern and responsive experience for both customers and administrators. The project uses the latest Angular 19 technologies with a focus on performance, usability, and maintainability.

## ✨ Key Features

### 👤 **Authentication & Authorization**
- Complete login and registration system
- JWT authentication with refresh tokens
- Role-based access control (Admin/Customer)
- Route protection with guards

### 🛍️ **Product Catalog**
- Product listing with infinite scroll
- Advanced search and filters
- Detailed product visualization
- Rating system
- Automatic fallback for broken images

### 🛒 **Shopping Cart**
- Persistent cart per user
- Product addition/removal with elegant modal
- Quantity control
- Automatic total calculation
- Real-time notification badge

### 💳 **Sales System**
- Complete checkout process
- Order history for customers
- Sales management for administrators
- Order cancellation
- Date filters with date range picker

### 👨‍💼 **Admin Panel**
- Complete product management (CRUD)
- Sales management
- Dashboard with metrics
- User control

### 🎨 **Interface & UX**
- Modern design with Angular Material 19
- Responsive layout with Bootstrap
- Elegant and harmonious color palette
- Intuitive navigation with sidebar menu
- Loading states and visual feedback
- Infinite scroll for better performance

## 🚀 Technologies Used

### **Core**
- **Angular 19** - Main framework with modern syntax (@if, @for)
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **Angular Signals** - Reactive state management

### **UI/UX**
- **Angular Material 19** - UI components
- **Bootstrap 5** - Grid system and utilities
- **Flexbox** - Responsive layout
- **SCSS** - CSS preprocessor

### **Advanced Features**
- **ngx-infinite-scroll** - Infinite scrolling
- **Standalone Components** - Modern architecture
- **Custom Directives** - Logic reusability
- **Route Guards** - Route protection

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── guards/              # Authentication and authorization guards
│   │   └── services/            # Global services (auth, cart, etc.)
│   ├── shared/                  # Shared components and resources
│   │   ├── components/          # Reusable components
│   │   ├── directives/          # Custom directives
│   │   └── interfaces/          # TypeScript interfaces
│   ├── features/                # Feature modules
│   │   ├── admin/               # Administrative area
│   │   ├── auth/                # Authentication
│   │   ├── cart/                # Shopping cart
│   │   ├── my-orders/           # Order history
│   │   └── products-list/       # Product catalog
│   ├── clients/                 # Generated HTTP clients
│   └── layout/                  # Layout components
└── assets/                      # Static resources
```

## 🛠️ Installation and Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Angular CLI 19

### **Installation**

```bash
# Clone the repository
git clone https://github.com/gabriel-dev-test/ambev-front.git
cd ambev-frontend

# Install dependencies 
npm install

# Configure environment variables
cp src/environments/environment.example.ts src/environments/environment.ts
```

### **Backend Configuration**

Edit the `src/environments/environment.ts` file:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Your backend URL
  // other configurations...
};
```

## 🚀 Available Commands

### **Development**
```bash
# Development server
npm start
# or
ng serve

# Access: http://localhost:4200
```

### **Build**
```bash
# Production build
npm run build
# or
ng build --configuration production
```

### **Linting**
```bash
# Check code
npm run lint
# or
ng lint

# Auto-fix
ng lint --fix
```

## 🎯 Features by Module

### **Authentication (`/auth`)**
- Email/password login
- New user registration
- Password recovery
- Automatic logout on expiration

### **Products (`/products`)**
- Catalog with infinite scroll
- Search by name/category
- Advanced filters
- Detailed visualization

### **Cart (`/cart`)**
- Addition via modal with quantity selection
- Complete item management
- Automatic total calculation
- Persistence between sessions

### **Orders (`/my-orders`)**
- Complete purchase history
- Order status
- Details of each sale
- Infinite scroll for history

### **Admin (`/admin`)**
- Administrative dashboard
- Complete product CRUD
- Sales management
- Reports and metrics

## 🎨 Design Patterns

### **Main Colors**
- **Primary**: Blue Slate (#334155, #475569)
- **Accent**: Emerald (#10b981)
- **Tertiary**: Violet (#8b5cf6)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### **Reusable Components**
- `ProductsListComponent` - Product list (admin/customer)
- `SaleCardComponent` - Shared sale card
- `ImageFallbackDirective` - Automatic image fallback
- `CartBadgeComponent` - Cart badge

## 🔧 Important Configurations

### **Angular 19 Features**
- Use of `@if` and `@for` instead of `*ngIf` and `*ngFor`
- Standalone components throughout the application
- Angular Signals for reactive state
- New control flow syntax

## 📱 Responsiveness

The project is fully responsive, supporting:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🔒 Security

- JWT authentication with refresh tokens
- Guards for route protection
- Input data sanitization
- Configured security headers
- Client-side and server-side validation

## 🚀 Performance

- Module lazy loading
- OnPush change detection strategy
- Infinite scroll for large lists
- Product cache in CartService
- Image optimization with fallback


**Developed with ❤️ for Ambev**
