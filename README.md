# 🎨 WhatsApp CRM - Frontend

A modern, responsive dashboard for managing WhatsApp marketing and CRM activities, built with **React** and **Vite**.

## 🛠️ Tech Stack
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: Fetch with custom wrappers in `src/lib/api`

## ✨ Features

### 🖥️ Dashboard & Analytics
- Visual overview of campaign performance.
- Key metrics: Total messages sent, delivery rates, and read receipts.
- Interactive charts and delivery funnels.


### 📥 Inbox & Chat
- Real-time messaging interface.
- Support for text, images, and template messages.
- Contact search and chat history.

### 📝 Template Builder
- Custom UI for designing WhatsApp templates.
- Support for dynamic variables (`{{1}}`, `{{2}}`).
- Real-time preview and Meta submission workflow.

### 👥 Contacts Management
- Dynamic list with infinite scroll/pagination.
- Tagging system (Bulk tag add/remove).
- CSV Import tool for large datasets.

### 📣 Campaigns
- Multi-step campaign creation wizard.
- Audience selection based on tags.
- Detailed progress tracking for live campaigns.

### ⚙️ Settings
- Meta Catalog linkage and configuration.
- API Key management (Generate, View, Revoke).
- Webhook token settings and universal URL generation.

## 🏗️ Project Structure
- `src/components`: Reusable UI components.
- `src/pages`: Main view components (Dashboard, Contacts, etc.).
- `src/lib/api`: Centralized API service functions.
- `src/features`: Redux slices and domain-specific logic.
- `src/constants`: App-wide configurations and language lists.

---
© 2026 WhatsApp OS Gateway by Agently Enterprise.
