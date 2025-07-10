# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Next.js Application
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Infrastructure (CDK)
- `cd infra && npm run build` - Compile TypeScript to JavaScript
- `cd infra && npm run watch` - Watch for changes and compile
- `cd infra && npm run test` - Run Jest unit tests
- `cd infra && npx cdk deploy` - Deploy stack to AWS
- `cd infra && npx cdk diff` - Compare deployed stack with current state
- `cd infra && npx cdk synth` - Emit synthesized CloudFormation template

## Architecture Overview

This is a full-stack application with the following components:

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling
- **Theme**: Dark/light mode support via next-themes
- **Key Routes**:
  - `/` - Landing page with hero section
  - `/auth` - Authentication page
  - `/create` - Multi-step project creation wizard
  - `/projects` - Projects listing and management
  - `/projects/[id]` - Individual project pages

### Backend Infrastructure (AWS CDK)
The infrastructure is defined in TypeScript using AWS CDK v2 and consists of multiple stacks:

- **VPCStack**: Network foundation with VPC, subnets, and security groups
- **DataStack**: Aurora PostgreSQL database with VPC integration
- **AuthStack**: AWS Cognito user pools and identity management
- **StorageStack**: S3 buckets for file storage with path-based access
- **HostingStack**: CloudFront distribution and domain setup
- **JSONUploadStack**: Lambda functions for JSON processing with SQS integration
- **CompleteStack**: Step Functions workflow for complex processing

### Key Dependencies
- **AWS Integration**: aws-amplify for frontend AWS integration
- **UI Framework**: shadcn/ui with Radix UI components
- **Forms**: react-hook-form with zod validation
- **Drag & Drop**: @hello-pangea/dnd for interactive components
- **Charts**: recharts for data visualization
- **Notifications**: sonner for toast notifications

## Development Workflow

### UI Components
All UI components follow shadcn/ui conventions and are located in `/components/ui/`. Custom components are organized in `/components/` with logical grouping (auth, create-steps, sections, themes).

### State Management
The application uses React hooks and context for state management. Authentication state is handled by AWS Amplify.

### Styling
- Tailwind CSS with CSS variables for theming
- Custom color palette defined in `tailwind.config.js`
- Dark/light mode toggle with `next-themes`
- Responsive design patterns

### Infrastructure Development
- All infrastructure code is in the `/infra` directory
- Each stack is modularized and follows AWS best practices
- Security hardening includes WAF, VPC Flow Logs, and proper IAM policies
- Production-ready features include automated backups, CloudWatch monitoring, and retention policies

## Testing

### Frontend
- ESLint for code quality
- TypeScript for type safety

### Infrastructure
- Jest unit tests for CDK stacks
- Use `npm run test` in the infra directory

## Important Notes

### Security
- The infrastructure includes production-ready security features
- WAF protection is enabled for API Gateway
- Database has deletion protection enabled
- All resources use proper encryption at rest and in transit

### Environment Setup
- CDK deploys to default AWS account/region
- Environment variables are used for AWS account/region configuration
- CORS is configured for specific domains (update in storage-stack.ts)

### Multi-Step Creation Flow
The `/create` route implements a comprehensive project creation wizard with steps for:
- Project naming and description
- Website type selection
- Database configuration
- Authentication setup
- Hosting configuration
- Payment integration
- Media storage
- Sitemap building

### AWS Integration
- Cognito for authentication
- S3 for file storage with user-specific paths
- Aurora PostgreSQL for data persistence
- Step Functions for complex workflows
- SQS for message queuing
- CloudWatch for monitoring and logging