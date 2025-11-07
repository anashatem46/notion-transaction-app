# Notion Transaction Entry App

A Node.js + Express application for entering transactions into Notion databases. This app provides a clean, mobile-responsive interface for quickly logging financial transactions with categories and accounts.

## Features

- **Transaction Entry**: Add transactions with name, amount, type (Expense/Income), date, account, category, and optional notes
- **Notion Integration**: Directly syncs with your Notion databases
- **Mobile Responsive**: Fully optimized for mobile devices (320px and up)
- **Real-time Validation**: Client and server-side validation for all required fields

## Prerequisites

- Node.js (v14 or higher)
- A Notion account
- Notion API access (create an integration at https://www.notion.so/my-integrations)

## Setup

### 1. Install Dependencies

```bash
npm install
```

Or if you prefer to install manually:

```bash
npm install express @notionhq/client dotenv express-session bcrypt
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
- `Spending Category` (Relation) - Relation to the Categories database
- `Note` (Rich Text) - Optional notes about the transaction

#### Categories Database Properties

Your Categories database should have:

- `Name` (Title) - The category name (e.g., "Food", "Transportation", "Entertainment")

#### Accounts Database Properties

Your Accounts database should have:

- `Name` (Title) - The account name (e.g., "Cash", "Credit Card", "Bank Account")

#### Share Databases with Integration

1. Open each database in Notion
2. Click the "..." menu in the top right
3. Select "Add connections" or "Connections"
4. Search for and select your integration
5. Repeat for all three databases (Transactions, Categories, Accounts)

### 3. Get Database IDs

1. Open each database in Notion
2. Look at the URL: `https://www.notion.so/workspace/DATABASE_ID?v=...`
3. Copy the `DATABASE_ID` (32-character alphanumeric string)
4. The ID is the part between the last `/` and the `?` in the URL

### 4. Environment Configuration

Create a `.env` file in the root directory:

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
```

**Important Notes:**
- Replace all placeholder values with your actual Notion API key and database IDs
- The `NOTION_CATEGORIES_DB_ID` is optional - if not provided, it will use the `NOTION_TRANSACTIONS_DB_ID`
- Never commit your `.env` file to version control
- Generate your password hash once using Node:

  ```bash
  node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourPassword', 12).then(console.log)"
  ```

  Copy the resulting hash into `APP_PASSWORD_HASH`.

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

Or:
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

The app will be available at the specified port (default: 3000).

3. You'll be redirected to the login page. Sign in with the username/password you configured in `.env`.

## Authentication

- The application is protected by a simple session-based login layer.
- Credentials are defined via `APP_USERNAME` and `APP_PASSWORD_HASH`.
- Sessions last for one hour; you can click **Log Out** in the UI to end the session immediately.
- When the session expires, API calls will return `401 Unauthorized` and the browser will redirect to `/login`.

## Project Structure

```
notion/
├── config/
│   └── notion.js          # Notion client and database configuration
├── routes/
│   ├── accounts.js         # Accounts API routes
│   ├── categories.js       # Categories API routes
│   ├── transactions.js    # Transactions API routes
│   └── health.js           # Health check route
├── public/
│   ├── index.html          # Authenticated transaction form
│   └── login.html          # Login page
├── server.js               # Main server entry point
├── package.json            # Dependencies and scripts
├── README.md               # Documentation
└── .env                    # Environment variables (not in repo)
```

## Usage

1. Sign in using your credentials at `/login`.

2. Fill in the transaction form:
   - **Transaction Name**: Enter a descriptive name
   - **Amount**: Enter the transaction amount
   - **Transaction Type**: Toggle between Expense and Income
   - **Date**: Select the transaction date (defaults to today)
   - **Account**: Select an account from the dropdown (required)
   - **Category**: Select a category from the dropdown (required)
   - **Note**: Add any additional details (optional)

3. Click "Save" to create the transaction in Notion

4. Use the **Log Out** button when you're done to end your session

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

**Response:**
```json
{
  "success": true,
  "pageId": "transaction-page-id",
  "message": "Transaction created successfully"
}
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

## Mobile Responsiveness

The app is fully responsive and optimized for:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktop screens

All form fields are touch-friendly and stack properly on smaller screens.

## Error Handling

The app includes comprehensive error handling:
- Missing required fields validation
- Notion API error handling
- Network error handling
- User-friendly error messages displayed in the UI

## Troubleshooting

### Accounts not loading
- Verify `NOTION_ACCOUNTS_DB_ID` is set in your `.env` file
- Ensure the Accounts database is shared with your Notion integration
- Check that the Accounts database has a "Name" property (Title type)

### Categories not loading
- Verify `NOTION_CATEGORIES_DB_ID` is set (or it will use Transactions DB ID)
- Ensure the Categories database is shared with your Notion integration
- Check that the Categories database has a "Name" property (Title type)

### Transactions not saving
- Verify all required fields are filled
- Check that the account and category IDs are valid
- Ensure the Transactions database is shared with your Notion integration
- Verify the property names in your Transactions database match exactly:
  - `Transaction Name`
  - `Amount`
  - `Transaction Type`
  - `Date`
  - `Linked Account`
  - `Spending Category`
  - `Note`

## License

MIT

