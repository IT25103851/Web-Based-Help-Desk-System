# UniAssist 360 — Module 3: Customer Feedback and Satisfaction Management

**Group KU-09 · SE2030 Software Engineering** · Assigned member: Dasunika W. B. N. – IT25100713
**Intended user(s):** End User / Manager

Collects customer feedback (CSAT 1–5 stars + comment) after a ticket is resolved and evaluates support quality.

This package is a **self-contained, runnable slice** of the UniAssist 360 project (Spring Boot backend + React frontend).
It contains this module's own files plus the supporting files the module needs in order to compile, start and be used.
Test files, `schema.sql` (reference DDL only – Hibernate creates the tables) and the project report are intentionally left out.

## Prerequisites
Java 17+, Node.js 18+, MySQL 8+ running on `localhost:3306`. (Maven wrapper included.)

## Run
1. `cp .env.example .env` and set `DB_USERNAME` / `DB_PASSWORD` if your MySQL root user has a password.
   `JWT_SECRET` and `BOOTSTRAP_ADMIN_PASSWORD` are **required** (the backend will not start without them); dev defaults are pre-filled.
2. Backend: `cd BackEnd && ./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`) → http://localhost:8080/api
3. Frontend: `cd FrontEnd && npm install && npm run dev` → http://localhost:5173
   (or run `start_project.sh` / `start_project.bat` from this folder to launch both).
4. Sign in with the bootstrap administrator (`admin` / the password in your `.env`).
   Students and lecturers can self-register; staff accounts are created by the administrator.

## How this slice differs from the full project
- `FrontEnd/src/App.jsx` and `FrontEnd/src/components/Navbar.jsx` are **generated variants**: they contain only the routes /
  menu entries for the pages shipped in this package (so the app builds without the other modules' components).
  All other frontend files are byte-for-byte the originals.
- All backend Java files are unchanged. `application.properties`, `pom.xml` are unchanged.
- `.env.example` has the two mandatory values pre-filled with development placeholders — change them for any real deployment.
- `pages/Dashboard.jsx` (the home screen) is the original; its widgets for modules not shipped here simply stay empty.

## File inventory
### Owned by this module (Module 3)

- `BackEnd · controller/FeedbackController.java`
- `BackEnd · model/Feedback.java`
- `BackEnd · repository/FeedbackRepository.java`
- `FrontEnd · components/CSATDashboard.jsx`
- `FrontEnd · components/CSATModal.jsx`

### Shared application core / shell

- `BackEnd · HelpdeskApplication.java`
- `BackEnd · config/GlobalExceptionHandler.java`
- `FrontEnd · App.css`
- `FrontEnd · App.jsx (generated variant)`
- `FrontEnd · components/Navbar.jsx (generated variant)`
- `FrontEnd · components/ui/Badge.jsx`
- `FrontEnd · components/ui/Button.jsx`
- `FrontEnd · components/ui/Card.jsx`
- `FrontEnd · components/ui/ConfirmDialog.jsx`
- `FrontEnd · components/ui/EmptyState.jsx`
- `FrontEnd · components/ui/LoadingState.jsx`
- `FrontEnd · components/ui/Modal.jsx`
- `FrontEnd · components/ui/PageHeader.jsx`
- `FrontEnd · context/ToastContext.jsx`
- `FrontEnd · index.css`
- `FrontEnd · main.jsx`
- `FrontEnd · pages/Dashboard.jsx`
- `FrontEnd · pages/HomePage.jsx`

### Supporting files from Module 1 – User & Access Control Management

- `BackEnd · config/DataSeeder.java`
- `BackEnd · controller/AuthController.java`
- `BackEnd · controller/UserController.java`
- `BackEnd · dto/AdminUserCreateRequest.java`
- `BackEnd · dto/AdminUserUpdateRequest.java`
- `BackEnd · dto/JwtResponse.java`
- `BackEnd · dto/LoginRequest.java`
- `BackEnd · dto/PasswordResetRequest.java`
- `BackEnd · dto/ProfileUpdateRequest.java`
- `BackEnd · dto/RegisterRequest.java`
- `BackEnd · dto/ResetPasswordRequest.java`
- `BackEnd · model/PasswordResetToken.java`
- `BackEnd · model/Role.java`
- `BackEnd · model/User.java`
- `BackEnd · repository/PasswordResetTokenRepository.java`
- `BackEnd · repository/UserRepository.java`
- `BackEnd · security/CustomUserDetails.java`
- `BackEnd · security/CustomUserDetailsService.java`
- `BackEnd · security/JwtAuthenticationFilter.java`
- `BackEnd · security/JwtUtils.java`
- `BackEnd · security/SecurityConfig.java`
- `BackEnd · service/PasswordResetService.java`
- `FrontEnd · components/ProtectedRoute.jsx`
- `FrontEnd · context/AuthContext.jsx`
- `FrontEnd · pages/LoginPage.jsx`
- `FrontEnd · pages/PasswordResetPage.jsx`
- `FrontEnd · pages/RegisterPage.jsx`

### Supporting files from Module 2 – Core Ticket Lifecycle Management

- `BackEnd · controller/AttachmentController.java`
- `BackEnd · controller/TicketController.java`
- `BackEnd · dto/AssignmentHistoryDTO.java`
- `BackEnd · dto/TicketAttachmentDTO.java`
- `BackEnd · dto/TicketRequest.java`
- `BackEnd · model/AssignmentAction.java`
- `BackEnd · model/Category.java`
- `BackEnd · model/Priority.java`
- `BackEnd · model/Status.java`
- `BackEnd · model/Ticket.java`
- `BackEnd · model/TicketAssignmentHistory.java`
- `BackEnd · model/TicketAttachment.java`
- `BackEnd · model/TicketComment.java`
- `BackEnd · repository/CategoryRepository.java`
- `BackEnd · repository/TicketAssignmentHistoryRepository.java`
- `BackEnd · repository/TicketAttachmentRepository.java`
- `BackEnd · repository/TicketCommentRepository.java`
- `BackEnd · repository/TicketRepository.java`
- `BackEnd · service/AttachmentService.java`
- `BackEnd · service/TicketDeletionService.java`
- `BackEnd · service/TicketService.java`
- `FrontEnd · components/AgentDashboard.jsx`
- `FrontEnd · components/CreateTicket.jsx`
- `FrontEnd · components/TicketDetails.jsx`
- `FrontEnd · components/TicketList.jsx`

### Supporting files from Module 5 – Central Notification and Messaging Management

- `BackEnd · model/Notification.java`
- `BackEnd · model/NotificationType.java`
- `BackEnd · model/UserNotificationPreferences.java`
- `BackEnd · repository/NotificationRepository.java`
- `BackEnd · repository/UserNotificationPreferencesRepository.java`
- `BackEnd · service/EmailService.java`
- `BackEnd · service/NotificationService.java`

### Supporting files from Module 6 – Analytics, Performance and Reporting Management

- `BackEnd · dto/AgentActivityLogDTO.java`
- `BackEnd · model/AgentActivityAction.java`
- `BackEnd · model/AgentActivityLog.java`
- `BackEnd · repository/AgentActivityLogRepository.java`
- `BackEnd · service/AgentActivityLogService.java`

