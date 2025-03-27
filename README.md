# Personal Journaling App

## Project Overview
The **Personal Journaling App** is a secure and intuitive platform designed for users to write, categorize, and analyze their journal entries. helps users track their writing habits, moods, and content trends over time. 
This full-stack application provides:
- Secure journal entry creation and management
- Rich text journal entries with categories and tags
- Sentiment analysis for mood tracking
- Interactive data visualizations
- Writing habit heatmaps
- Word clouds and content analysis

## Features
### 1. User Authentication
- Secure user registration and login.
- JWT-based authentication for session management.
- Role-based access control for security.
![img_4.png](img_4.png)
![img_3.png](img_3.png)

### 2. Journal Entry Management
- Create, edit, and delete journal entries.
- Categorize entries into Personal, Work, Travel, etc.
- 😊 Mood tracking with automatic sentiment detection
- 📅 Date-based organization
- Optimistic updates for improved UX.
![img_2.png](img_2.png)

### 3. Analytics Dashboard
View all journal entries analytics with:
- 📊 Interactive charts and graphs
- 📈 Writing frequency heatmaps
- ☁️ Word clouds from journal content
- 📉 Mood trend analysis
- 📝 Category distribution visualization
![img_1.png](img_1.png)
### 4. Categorization & Tagging
- Flexible tagging system for easy organization.

### 5. Summary View
#### Analytical insights through:
- Writing frequency heatmap.
- Category distribution via pie/bar charts.
- Word count trends over time.
- Average entry length by category.
- Time-of-day writing patterns.
- Word clouds for frequent phrases.
- Mood tracking via sentiment analysis.

### 6. Profile Settings
- Profile and preference management.

## Technology Stack
### Frontend
- **React.js with Remix framework**
- TypeScript preferred, JavaScript acceptable.
- Chart.js for data visualizations
- CoreUI for UI components
- React Big Calendar for journal calendar
- Wordcloud.js for content analysis

### Backend
- Node.js with Express
- Prisma ORM for database operations
- Support Mysql,PostgreSQL,e.t.c database
- Sentiment analysis library

### Database
- PostgreSQL or MySQL (using Prisma ORM for database management).

## Deployment
- CI/CD pipeline
- Cloud hosting
- Docker containerization (optional)

## Installation & Setup
### Prerequisites
- Node.js & npm/yarn installed.
- PostgreSQL/MySQL installed & configured.
- Docker (optional)

### Steps to Set Up Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/IsaacMwauraMuturi/app-journal.git
   cd app-journal
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure the environment variables:
    - Copy `.env.example` to `.env`
    - Update database credentials in `.env`
      - Eg ```  DATABASE_URL="mysql://root:@localhost:3306/myjournalapp" or DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
                JWT_SECRET=your-secret-key
                NODE_ENV=development
                SESSION_SECRET=your-secret-key```
4. Run database migrations:
   ```sh
   npx prisma migrate deploy
   npx prisma generate
   ```
5. Seed the database to insert the admin user:
   ```sh
   npx prisma db seed 
   ```
   
6. Start the application:
   ```sh
   npm run dev
   ```
   Running with Docker
   ```sh
   docker-compose up --build
   ```
7. Open **Prisma Studio** to verify database tables:
   ```sh
   npx prisma studio
   ```
   


## System Design
### Architecture
- **Frontend**: Next.js with SSR & CSR for performance.
- **Backend**: Node.js with Express for scalable API.
- **Database**: Mysql, PostgreSQL with Prisma ORM.

### Security Considerations
- Secure password storage using bcrypt.
- JWT-based authentication.
- Input validation & sanitation to prevent XSS/SQL injection.

### Future Enhancements
- AI-generated journal prompts
- Mobile application using React Native
- Export and backup journal entries

### Scaling Considerations
- Database indexing & caching strategies.
- Asynchronous processing for intensive tasks.
- Load balancing and microservices for large-scale deployment.

## AI/ML-Enhanced Features
- Sentiment analysis for mood tracking.

## Testing
- Unit, integration, and E2E tests implemented.
- Jest & Cypress for test coverage.

## Contribution Guidelines
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes with clear messages.
4. Push the branch and create a pull request.

## License
This project is licensed under the **MIT License**.

## Contact
For inquiries, reach out via **mwauraisaac9@gmail.com**.

