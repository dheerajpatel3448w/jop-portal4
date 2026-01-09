# Hire Heaven - Job Portal Platform

A comprehensive job portal platform built with modern technologies to connect job seekers with top employers in India.

## 🚀 Features

### For Job Seekers
- User registration with resume upload
- Browse and apply to jobs
- Resume analyzer for optimization
- Career guidance tools
- Real-time application status updates

### For Recruiters
- Company profile creation
- Job posting and management
- Application review and management
- Premium subscription features

### Platform Features
- Secure authentication with JWT
- Role-based access control (Job Seeker/Recruiter)
- File upload handling
- Email notifications
- Payment integration
- Real-time messaging with Kafka
- Caching with Redis
- Containerized deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Radix UI** - Component library (shadcn/ui)
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Next Themes** - Dark mode support
- **React Hot Toast** - Notifications

### Backend (Microservices Architecture)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL (Neon)** - Database
- **Redis** - Caching
- **Kafka** - Message queue
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Zod** - Validation

### DevOps & Tools
- **Docker** - Containerization
- **pnpm** - Package manager
- **ESLint** - Code linting

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker & Docker Compose (optional)
- PostgreSQL database (or Neon account)
- Redis instance
- Kafka cluster

## 🏗️ Project Structure

```
job-portal4/
├── job-portal-backend/
│   ├── auth-service/          # Authentication microservice
│   ├── job_service/           # Job management microservice
│   ├── payment-service/       # Payment processing microservice
│   ├── user-service/          # User management microservice
│   └── utils-service/         # Utility services (file upload, etc.)
└── job-portal-frontend/       # Next.js frontend application
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd job-portal4
```

### 2. Environment Setup

Create environment files for each service. Check the respective `src/configs/` directories for required environment variables.

Example `.env` for auth-service:
```env
DB_URI=your_neon_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
UTILS_SERVICE_URL=http://localhost:3005
KAFKA_BROKER=localhost:9092
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 3. Backend Setup

#### Install Dependencies
Navigate to each backend service and install dependencies:

```bash
cd job-portal-backend/auth-service
pnpm install

cd ../job_service
pnpm install

cd ../payment-service
pnpm install

cd ../user-service
pnpm install

cd ../utils-service
pnpm install
```

#### Database Setup
- Create a Neon PostgreSQL database
- Run database migrations (check individual service configs for schema setup)
- Ensure Redis is running
- Set up Kafka cluster

#### Start Backend Services
Start each service in separate terminals:

```bash
# Auth Service (port 3001)
cd job-portal-backend/auth-service
pnpm run dev

# Job Service (port 3002)
cd job-portal-backend/job_service
pnpm run dev

# Payment Service (port 3003)
cd job-portal-backend/payment-service
pnpm run dev

# User Service (port 3004)
cd job-portal-backend/user-service
pnpm run dev

# Utils Service (port 3005)
cd job-portal-backend/utils-service
pnpm run dev
```

### 4. Frontend Setup

```bash
cd job-portal-frontend
pnpm install
pnpm run dev
```

The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment (Alternative)

Each service includes a Dockerfile. You can build and run containers individually:

```bash
# Build and run auth service
cd job-portal-backend/auth-service
docker build -t auth-service .
docker run -p 3001:3001 auth-service

# Similarly for other services...
```

## ☁️ AWS Deployment

Deploy your Hire Heaven application to AWS using containerized microservices.

### Prerequisites
- AWS CLI configured
- AWS account with necessary permissions
- Domain name (optional, for production)

### Infrastructure Components

#### 1. Container Registry
```bash
# Build and push Docker images to Amazon ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# For each service
cd job-portal-backend/auth-service
docker build -t hire-heaven-auth .
docker tag hire-heaven-auth:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/hire-heaven-auth:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/hire-heaven-auth:latest

# Repeat for job_service, payment-service, user-service, utils-service
```

#### 2. Database & Caching
- **Database**: Neon PostgreSQL (already serverless, no AWS deployment needed)

- **Kafka**: Use Amazon Managed Streaming for Kafka (MSK)

#### 3. ECS Cluster with Fargate
Create an ECS cluster and deploy services:

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name hire-heaven-cluster

# Create task definitions for each service (example for auth-service)
aws ecs register-task-definition --cli-input-json file://task-definition-auth.json

# Create services
aws ecs create-service --cluster hire-heaven-cluster --service-name auth-service --task-definition hire-heaven-auth --desired-count 2 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```




#### 6. Frontend Deployment
Deploy Next.js app to AWS Amplify:

```bash
# Connect repository to Amplify
aws amplify create-app --name hire-heaven-frontend --repository <repo-url> --branch main --build-spec buildspec.yml

# Or deploy to S3 + CloudFront
aws s3 sync ./job-portal-frontend/out s3://hire-heaven-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

### Environment Variables for Production
Update your environment variables for production:

```env
DB_URI=your_production_neon_url
REDIS_URL=your_elasticache_endpoint
KAFKA_BROKER=your_msk_bootstrap_servers
JWT_SECRET=your_secure_jwt_secret
UTILS_SERVICE_URL=https://your-alb-url/utils
# ... other service URLs
```

### Monitoring & Logging
```bash
# Enable CloudWatch logging
aws logs create-log-group --log-group-name /ecs/hire-heaven

# Set up CloudWatch alarms for monitoring
aws cloudwatch put-metric-alarm --alarm-name high-cpu --alarm-description "High CPU usage" --metric-name CPUUtilization --namespace AWS/ECS --statistic Average --period 300 --threshold 80 --comparison-operator GreaterThanThreshold --dimensions Name=ClusterName,Value=hire-heaven-cluster Name=ServiceName,Value=auth-service
```

### Cost Optimization
- Use Fargate Spot for non-critical workloads
- Implement auto-scaling based on CPU/memory usage
- Use reserved instances for steady-state services
- Monitor and optimize resource allocation

### Security Best Practices
- Use AWS Secrets Manager for sensitive data
- Implement VPC with private subnets for services
- Enable AWS WAF for frontend protection
- Use IAM roles with least privilege
- Enable encryption at rest and in transit

## 📖 API Documentation

### Auth Service Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### Job Service Endpoints
- `POST /job/company` - Create company (Recruiter only)
- `POST /job/post` - Create job posting
- `GET /job/all` - Get all jobs
- `POST /job/apply` - Apply for job

### Utils Service Endpoints
- `POST /utils/upload` - File upload

## 🔧 Development

### Code Quality
```bash
# Run linting
pnpm run lint

# Build for production
pnpm run build
```

### Testing
Add tests using your preferred testing framework (Jest, Vitest, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.


---

Built with ❤️ using modern web technologies</content>
<parameter name="filePath">c:\Users\patel\OneDrive\Desktop\Big_Ai_projects\job-portal4\README.md