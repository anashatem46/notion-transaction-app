# How to Get the Correct Notion Database ID

## ⚠️ Common Error
If you see: **"Provided ID is a page, not a database"**

This means you're using a **page ID** instead of a **database ID**.

---

## ✅ Correct Method: Get Database ID

### Step 1: Open Database as Full Page
1. In Notion, find your database (Transactions, Categories, or Accounts)
2. Click on the database title or open it in a new page
3. Make sure you're viewing the **database itself**, not a page inside it

### Step 2: Copy the URL
1. Look at your browser's address bar
2. The URL will look like:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
   ```
   OR
   ```
   https://www.notion.so/DATABASE_ID?v=...
   ```

### Step 3: Extract the Database ID
- The Database ID is the **32-character string** between the last `/` and the `?`
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **DO NOT** include the `?v=...` part
- **DO NOT** include any hyphens that are part of the URL structure

### Example:
```
URL: https://www.notion.so/15600e10c5f1818583cac03beac96d62?v=abc123

✅ Correct Database ID: 15600e10c5f1818583cac03beac96d62
❌ Wrong (page ID): 15600e10-c5f1-8185-83ca-c03beac96d62
```

---

## 🔍 How to Tell the Difference

### Database ID (Correct):
- 32 characters (alphanumeric)
- Usually **without hyphens** in the URL
- Found when viewing the database as a full page
- URL pattern: `.../DATABASE_ID?v=...`

### Page ID (Wrong):
- 32 characters with hyphens: `xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Found when viewing a specific page/row inside the database
- URL pattern: `.../PAGE_ID` (no `?v=` usually)

---

## 📝 Quick Checklist

For each database (Transactions, Categories, Accounts):

- [ ] Opened database as a full page (not a row/page inside it)
- [ ] Copied URL from address bar
- [ ] Extracted the 32-character ID before `?v=`
- [ ] Removed hyphens if present (database IDs in URLs usually don't have hyphens)
- [ ] Added to `.env` file
- [ ] Shared database with Notion integration

---

## 🛠️ Alternative Method: Using Notion API

If you're still having trouble, you can use the Notion API to find database IDs:

1. Get a list of all databases your integration can access
2. Find the one you need by name
3. Copy its ID

But the URL method above is usually easier!

---

## 💡 Pro Tip

When you open a database in Notion:
- **Full page view** = Database ID (what you need)
- **Inline database** = Might give you a page ID (wrong)

Always open databases as full pages to get the correct ID!

