# AGENTS.md

# Enterprise Data Integration & ETL Automation Platform

## Ezitech Engineering Framework — MERN-009

---

# 1. Purpose of This Document

This document defines the engineering rules that must be followed by every developer, AI coding agent, automation agent, and technical contributor working on the Enterprise Data Integration and ETL Automation Platform.

* System architecture
* Module boundaries
* Folder structure
* Coding standards
* Role-Based Access Control
* Multi-tenant data isolation
* Backend development
* Frontend development
* Pipeline execution
* ETL processing
* Background workers
* Queue processing
* Monitoring
* Testing
* Documentation
* Per-session agent responsibilities
* Definition of Done

Every implementation session must follow this document.

No agent should introduce a new pattern, framework, folder, library, module, or architectural approach without ensuring it is compatible with the rules defined here.

---

# 2. Project Overview

The platform must support data integration from:

* REST APIs
* MySQL
* PostgreSQL
* MongoDB
* CSV files
* Excel files
* FTP servers
* SFTP servers
* Webhooks
* Cloud storage
* Third-party applications

The platform must allow users to visually build data pipelines containing:

* Source nodes
* Filter nodes
* Mapping nodes
* Transformation nodes
* Validation nodes
* Merge nodes
* Destination nodes

The platform must also provide:

* Pipeline scheduling
* Pipeline monitoring
* Queue monitoring
* Worker monitoring
* Error handling
* Retry mechanisms
* Data quality reporting
* Notifications
* Audit logging
* Dashboard analytics
* Role-Based Access Control
* Multi-tenant organization management

---

# 3. Project Objectives

---

# 4. Core Engineering Principles

All project code must follow these principles.

## 4.1 Separation of Concerns

Each module should have one clear responsibility.

Examples:

* Controllers handle HTTP requests and responses.
* Services contain business logic.
* Repositories handle database access.
* Workers execute background jobs.
* Validators validate input and business rules.
* Mappers transform one data structure into another.
* React components render user interfaces.
* React Query handles server state.
* Redux Toolkit handles shared client-side application state.

A single file must not contain unrelated responsibilities.

---

## 4.2 SOLID Principles

The platform should follow SOLID principles where practical.

### Single Responsibility Principle

Each class, service, function, component, and module should have one primary reason to change.

### Open/Closed Principle

Modules should be extendable without modifying stable core behavior.

For example, adding a new connector should not require rewriting the complete pipeline engine.

### Liskov Substitution Principle

Connector and node implementations must behave consistently with their shared interfaces.

### Interface Segregation Principle

### Dependency Inversion Principle

High-level services should depend on interfaces and abstractions rather than direct infrastructure implementations.

---

## 4.3 DRY

* Validation logic
* Permission checks
* Database query patterns
* Error responses
* API response formats
* Logging logic
* Data mapping logic
* Connector logic

---

## 4.4 KISS

---

## 4.5 Type Safety

The entire project should use TypeScript.

> **Frontend override (2026-08-22, explicit user instruction):** the
> frontend now uses plain JavaScript (`.js`/`.jsx`), not TypeScript.
> This section's TypeScript rules apply to the backend only. See the
> §5.1 note below for the paired styling-stack change. Documented
> here per agent-rules.md §3/§4 rather than silently editing this
> spec — this is a standing project decision, not an omission.

Rules:

* Enable TypeScript strict mode.
* Avoid `any`.
* Use `unknown` for untrusted data.
* Define interfaces for domain entities.
* Define DTOs for API inputs.
* Define response types for API outputs.
* Type React component props.
* Type Redux state and actions.
* Type BullMQ job payloads.
* Type Socket.IO events.
* Type environment variables where practical.

---

## 4.6 API-First Design

Backend APIs should be defined before the frontend depends on them.

Each API should clearly define:

* Endpoint
* HTTP method
* Authentication requirement
* Permission requirement
* Request parameters
* Request body
* Validation rules
* Response structure
* Error responses

---

## 4.7 Modular Design

The system should be organized into independent business modules.

Modules should interact through:

* Public services
* Interfaces
* Events
* Queues
* Shared domain types

Modules must not directly access another module's internal repository, internal model, or private implementation.

---

## 4.8 Security by Default

Every feature must consider:

* Authentication
* Authorization
* Organization isolation
* Input validation
* Sensitive data protection
* Audit logging
* Rate limiting
* Secure error messages
* Secret management

---

## 4.9 Fault Tolerance

The system must safely handle:

* Source connection failures
* Destination connection failures
* Invalid records
* Queue failures
* Worker crashes
* Network timeouts
* Partial pipeline failures
* Temporary Redis failures
* Duplicate job execution
* Retry exhaustion

---

## 4.10 Observability

Important operations must be observable through:

* Structured logs
* Execution metrics
* Pipeline status
* Queue status
* Worker health
* Error records
* Audit logs
* Notifications
* Correlation IDs

---

# 5. Technology Stack

## 5.1 Frontend

* React
* TypeScript
* React Flow
* Redux Toolkit
* React Query
* React Router
* Axios or Fetch wrapper
* Socket.IO Client
* Form validation library
* Charting library

> **Override (2026-08-22, explicit user instruction):** the frontend
> uses plain JavaScript instead of TypeScript, and Tailwind CSS
> (utility classes, configured in `tailwind.config.js` against
> `src/styles/tokens.css`'s design tokens) alongside custom CSS
> instead of CSS Modules per screen. All screens built before this
> date (SCR-001, SCR-002) were migrated; every screen built after it
> follows this stack. React Flow/Axios/Socket.IO Client/form
> validation/charting library choices remain open per the original
> list above — this override only changes the language and styling
> approach, not the rest of the stack.

## 5.2 Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* Redis
* BullMQ
* Socket.IO
* JWT
* Express middleware

## 5.3 Infrastructure

* Docker
* Docker Compose
* MongoDB container
* Redis container
* Backend API container
* Background worker container
* Frontend container
* Optional reverse proxy
* Optional object storage for uploaded files

---

# 6. Architecture Style

The application should use a modular monolith architecture with event-driven and queue-based processing.

The architecture should remain microservice-ready.

---

# 7. High-Level Architecture

```text
|                         React Frontend                      |
|-------------------------------------------------------------|
| Dashboard | Pipeline Builder | Monitoring | Reports | Admin |
|                       Express API Layer                     |
|-------------------------------------------------------------|
| Auth | Organizations | Users | Pipelines | Sources | Reports|
|                         Service Layer                       |
|-------------------------------------------------------------|
| Pipeline Service | RBAC Service | Scheduler | Notification  |
|                      Pipeline Orchestrator                  |
|-------------------------------------------------------------|
| State Machine | Node Resolver | Execution Context | Events   |
|                         BullMQ Queues                       |
|-------------------------------------------------------------|
| Extract | Transform | Validate | Load | Notify | Retry       |
|                       Background Workers                    |
|-------------------------------------------------------------|
| Connector Workers | ETL Workers | Validation Workers        |
| Data Sources  | MongoDB     | Redis       | Destinations    |
```

---

# 8. Architecture Layers

## 8.1 Presentation Layer

* React pages
* React components
* API controllers
* Route handlers
* Socket.IO gateways

Responsibilities:

* Accept input
* Display output
* Send requests
* Return responses
* Display validation messages
* Display loading and error states

The presentation layer must not contain core business logic.

---

## 8.2 Application Layer

Examples:

* Create a pipeline
* Execute a pipeline
* Test a data source
* Retry a failed execution
* Invite an organization user
* Generate a report

* Services
* Use cases
* Application DTOs
* Command handlers
* Query handlers

---

## 8.3 Domain Layer

Examples:

* Pipeline
* Pipeline node
* Pipeline execution
* Validation rule
* Organization
* Role
* Permission
* Data source
* Destination
* Schedule

The domain layer must not depend directly on Express, MongoDB, React, BullMQ, or Socket.IO.

---

## 8.4 Infrastructure Layer

Examples:

* MongoDB repositories
* Redis clients
* BullMQ queues
* Connector implementations
* Email providers
* File parsers
* Socket.IO adapters
* Logging providers

---

# 9. Multi-Tenant Architecture

The application should support multiple organizations.

## 9.1 Tenant Hierarchy

```text
    ├── Users
```

## 9.2 Tenant Isolation Rules

* Every organization-owned document must contain `organizationId`.
* All organization-level queries must filter by `organizationId`.
* A user must not access another organization's resources.
* Organization IDs must come from the authenticated session, not directly from untrusted request bodies.
* Super Admin may access all organizations.
* Organization Admin may access only their assigned organization.
* Background jobs must include `organizationId`.
* Socket.IO rooms must be separated by organization.
* Audit logs must contain `organizationId`.
* Uploaded files must be stored using organization-specific paths or identifiers.
* Cache keys must include `organizationId`.

Example cache key:

```text
```

---

# 10. Authentication Architecture

The authentication module should support:

* Login
* Logout
* Access token
* Refresh token
* Forgot password
* Reset password
* Change password
* Email verification
* Session management
* Optional two-factor authentication
* Account activation and deactivation

## 10.1 Registration Rule

Public self-registration should not be enabled by default.

User creation should be performed by:

* Super Admin
* Organization Admin
* Authorized invitation workflow

## 10.2 Token Design

Use:

* Short-lived access token
* Longer-lived refresh token
* Refresh-token rotation where practical
* Server-side refresh token tracking
* Token revocation on logout or account deactivation

## 10.3 Authentication Request Flow

```text
User Validation
```

---

# 11. Role-Based Access Control

The platform should implement enterprise Role-Based Access Control.

Authorization must be permission-based rather than relying only on role names.

Example:

```text

- pipeline:create
- pipeline:read
- pipeline:update
- pipeline:execute
- pipeline:schedule
- source:read
- destination:read
- validation:manage
- transformation:manage
```