# Notion Transaction Entry App

A Node.js + Express application with React frontend for entering financial transactions into Notion databases. Features a clean, responsive interface built with Tailwind CSS and a scalable, maintainable codebase architecture.

## Features

- **Transaction Entry**: Add transactions with name, amount, type (Expense/Income), date, account, category (optional for income), and optional notes
- **Notion Integration**: Directly syncs with your Notion databases
- **Modern UI**: Built with Tailwind CSS and React components
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Account Management**: Quick view of account balances with customizable account selection
- **Recent Activity**: View recent transactions with collapsible section
- **Real-time Validation**: Client and server-side validation for all required fields

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React (via CDN), Tailwind CSS
- **Database**: Notion API
- **Authentication**: Session-based with bcrypt password hashing

## Prerequisites

- Node.js (v14 or higher)
- A Notion account
- Notion API access (create an integration at https://www.notion.so/my-integrations)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Notion Setup

#### Create Notion Databases

You'll need to create three databases in Notion:

1. **Transactions Database** - Main database for storing transactions
2. **Categories Database** - Database for spending categories
3. **Accounts Database** - Database for accounts (e.g., Cash, Credit Card, Bank Account)

#### Transactions Database Properties

Your Transactions database should have the following properties:

- `Transaction Name` (Title) - The name of the transaction
- `Amount` (Number) - The transaction amount
- `Transaction Type` (Select) - Options: "Expense" or "Income"
- `Date` (Date) - The date of the transaction
- `Linked Account` (Relation) - Relation to the Accounts database
- `Spending Category` (Relation) - Relation to the Categories database (optional for income transactions)
- `Note` (Rich Text) - Optional notes about the transaction

#### Categories Database Properties

Your Categories database should have:

- `Name` (Title) - The category name (e.g., "Food", "Transportation", "Entertainment")

#### Accounts Database Properties

Your Accounts database should have:

- `Name` (Title) - The account name (e.g., "Cash", "Credit Card", "Bank Account")
- `Current Status` (Number or Formula) - The account balance

#### Share Databases with Integration

1. Open each database in Notion
2. Click the "..." menu in the top right
3. Select "Add connections" or "Connections"
4. Search for and select your integration
5. Repeat for all three databases (Transactions, Categories, Accounts)

### 3. Get Database IDs

1. Open each database in Notion as a full page
2. Look at the URL: `https://www.notion.so/workspace/DATABASE_ID?v=...`
3. Copy the `DATABASE_ID` (32-character alphanumeric string before `?v=`)
4. See `GET_DATABASE_ID.md` for detailed instructions

### 4. Environment Configuration

Create a `.env` file in the root directory (use `.env.example` as a template):

```env
# Notion API Configuration
NOTION_API_KEY=your_notion_api_key_here

# Notion Database IDs
NOTION_TRANSACTIONS_DB_ID=your_transactions_database_id_here
NOTION_CATEGORIES_DB_ID=your_categories_database_id_here
NOTION_ACCOUNTS_DB_ID=your_accounts_database_id_here

# Authentication
SESSION_SECRET=replace_with_strong_random_secret
APP_USERNAME=your_username_here
APP_PASSWORD_HASH=your_bcrypt_password_hash_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Important Notes:**
- Replace all placeholder values with your actual Notion API key and database IDs
- The `NOTION_CATEGORIES_DB_ID` is optional - if not provided, it will use the `NOTION_TRANSACTIONS_DB_ID`
- Never commit your `.env` file to version control
- Generate your password hash using:
  ```bash
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourPassword', 12).then(console.log)"
  ```

### 5. Get Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "Transaction App")
4. Select the workspace where your databases are located
5. Copy the "Internal Integration Token" - this is your `NOTION_API_KEY`

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. You'll be redirected to the login page. Sign in with the username/password you configured in `.env`.

## Authentication

- The application is protected by session-based authentication
- Credentials are defined via `APP_USERNAME` and `APP_PASSWORD_HASH` in `.env`
- Sessions last for one hour; you can click **Log Out** in the UI to end the session immediately
- When the session expires, API calls will return `401 Unauthorized` and the browser will redirect to `/login`

## Project Structure

```
notion/
├── config/
│   └── notion.js              # Notion client configuration
├── constants/
│   ├── config.js              # Application configuration constants
│   ├── errors.js              # Error codes and messages
│   └── notionProperties.js    # Notion property name mappings
├── middleware/
│   ├── auth.js                # Authentication middleware
│   ├── errorHandler.js        # Centralized error handling
│   ├── logger.js              # Request/error logging
│   └── validation.js          # Request validation utilities
├── services/
│   ├── notionService.js       # Notion API service layer
│   ├── transactionService.js  # Transaction business logic
│   ├── accountService.js      # Account business logic
│   ├── categoryService.js     # Category business logic
│   └── balanceService.js      # Balance calculation logic
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── accounts.js            # Accounts API routes
│   ├── categories.js          # Categories API routes
│   ├── transactions.js        # Transactions API routes
│   ├── balance.js             # Balance API routes
│   ├── recent-transactions.js # Recent transactions API routes
│   └── health.js              # Health check route
├── public/
│   ├── index.html             # Main application page
│   ├── login.html             # Login page
│   └── src/
│       ├── App.jsx             # Main React application
│       ├── components/        # React components
│       │   ├── TransactionForm.jsx
│       │   ├── AccountTabs.jsx
│       │   ├── RecentActivity.jsx
│       │   ├── AccountModal.jsx
│       │   └── StatusMessage.jsx
│       ├── services/          # Frontend services
│       │   ├── api.js
│       │   └── localStorage.js
│       ├── utils/             # Utility functions
│       │   └── formatters.js
│       ├── constants/         # Frontend constants
│       │   └── api.js
│       ├── loader.js          # Module loader for browser
│       └── tailwind-custom.css # Custom Tailwind colors
├── server.js                  # Main server entry point
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## Usage

1. Sign in using your credentials at `/login`.

2. Fill in the transaction form:
   - **Transaction Name**: Enter a descriptive name (required)
   - **Amount**: Enter the transaction amount (required)
   - **Transaction Type**: Toggle between Expense and Income (required)
   - **Date**: Select the transaction date, defaults to today (required)
   - **Account**: Select an account from the dropdown (required)
   - **Category**: Select a category from the dropdown (required for expenses, optional for income)
   - **Note**: Add any additional details (optional)

3. Click "Save" to create the transaction in Notion

4. View account balances in the quick view tabs at the top

5. Click "Customize" to select which accounts appear in the quick view

6. Expand "Recent Activity" to see your latest transactions

7. Use the **Log Out** button when you're done to end your session

## API Endpoints

### GET /categories
Fetches all categories from the Notion Categories database.

**Response:**
```json
[
  { "id": "category-id-1", "name": "Food" },
  { "id": "category-id-2", "name": "Transportation" }
]
```

### GET /accounts
Fetches all accounts from the Notion Accounts database.

**Response:**
```json
[
  { "id": "account-id-1", "name": "Cash" },
  { "id": "account-id-2", "name": "Credit Card" }
]
```

### GET /balance
Fetches account balances with last transaction information.

**Response:**
```json
{
  "accounts": [
    {
      "id": "account-id-1",
      "name": "Cash",
      "balance": 1500.00,
      "lastTransaction": {
        "amount": 50.00,
        "type": "expense"
      }
    }
  ]
}
```

### POST /transaction
Creates a new transaction in Notion.

**Request Body:**
```json
{
  "name": "Grocery shopping",
  "amount": 45.50,
  "type": "Expense",
  "date": "2024-01-15",
  "account": "account-id-1",
  "category": "category-id-1",
  "note": "Weekly groceries"
}
```

**Note:** `category` is optional for "Income" transactions, required for "Expense" transactions.

**Response:**
```json
{
  "success": true,
  "pageId": "transaction-page-id",
  "message": "Transaction created successfully"
}
```

### GET /recent-transactions?limit=5
Gets recent transactions sorted by date.

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 5, max: 100)

**Response:**
```json
[
  {
    "name": "Grocery shopping",
    "amount": 45.50,
    "type": "expense",
    "date": "2024-01-15"
  }
]
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Design & Styling

The application uses **Tailwind CSS** with a custom color palette:

- **Primary (Dark Blue)**: `#1B3C53`
- **Secondary (Medium Blue)**: `#234C6A`
- **Accent (Light Blue)**: `#456882`
- **Light Gray**: `#E3E3E3`
- **Background**: `#E3E3E3`
- **Card Background**: `#ffffff`

All styling is done through Tailwind utility classes for maintainability and consistency.

## Architecture

### Backend Architecture

- **Service Layer**: Business logic separated from routes
  - `notionService.js`: Notion API interactions and property detection
  - `transactionService.js`: Transaction creation and retrieval
  - `accountService.js`: Account management
  - `categoryService.js`: Category management
  - `balanceService.js`: Balance calculations

- **Middleware**: Reusable request processing
  - `auth.js`: Authentication and authorization
  - `errorHandler.js`: Centralized error handling
  - `logger.js`: Request and error logging
  - `validation.js`: Request validation utilities

- **Constants**: Centralized configuration
  - `config.js`: Application configuration
  - `errors.js`: Error codes and messages
  - `notionProperties.js`: Notion property mappings

### Frontend Architecture

- **React Components**: Modular, reusable UI components
- **Services**: API communication and localStorage management
- **Utils**: Formatting and utility functions
- **Module System**: Browser-compatible module loader

## Mobile Responsiveness

The app is fully responsive and optimized for:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktop screens

All form fields are touch-friendly and layouts adapt to screen sizes using Tailwind's responsive breakpoints.

## Error Handling

The app includes comprehensive error handling:
- Missing required fields validation
- Notion API error handling with helpful messages
- Network error handling
- User-friendly error messages displayed in the UI
- Centralized error handling middleware

## Troubleshooting

### Accounts not loading
- Verify `NOTION_ACCOUNTS_DB_ID` is set in your `.env` file
- Ensure the Accounts database is shared with your Notion integration
- Check that the Accounts database has a "Name" property (Title type)
- Verify the "Current Status" property exists for balance display

### Categories not loading
- Verify `NOTION_CATEGORIES_DB_ID` is set (or it will use Transactions DB ID)
- Ensure the Categories database is shared with your Notion integration
- Check that the Categories database has a "Name" property (Title type)

### Transactions not saving
- Verify all required fields are filled
- For expenses, ensure category is selected
- For income, category is optional
- Check that the account and category IDs are valid
- Ensure the Transactions database is shared with your Notion integration
- Verify the property names in your Transactions database match expected names (the app will auto-detect common property names)

### Database ID errors
- See `GET_DATABASE_ID.md` for detailed instructions on getting correct database IDs
- Make sure you're using database IDs, not page IDs
- Database IDs are found in the URL when viewing the database as a full page

## License

MIT
