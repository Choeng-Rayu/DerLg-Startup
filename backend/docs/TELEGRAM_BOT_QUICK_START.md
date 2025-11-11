# Telegram Bot Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Telegram User ID

1. Open Telegram
2. Search for `@userinfobot`
3. Send `/start`
4. Copy your user ID (e.g., `123456789`)

### Step 2: Configure Environment

The `.env` file should already have the bot token:
```bash
TELEGRAM_BOT_TOKEN=7554734364:AAHZCJhLrojIb8djpCu5AA8udvItOS6z2rM
```

### Step 3: Create Test Data

**Option A: Using the Seed Script**
```bash
# Edit the script and replace YOUR_TELEGRAM_ID_HERE with your actual ID
nano backend/src/scripts/seedTelegramProviders.ts

# Run the seed script
npm run seed:telegram
```

**Option B: Manual SQL Insert**
```sql
-- Replace YOUR_TELEGRAM_ID with your actual Telegram user ID
INSERT INTO guides (
  id, name, phone, email, telegram_user_id, telegram_username,
  specializations, languages, status, created_by, last_status_update
) VALUES (
  UUID(), 'Test Guide', '+855123456789', 'test@example.com',
  'YOUR_TELEGRAM_ID', 'your_username',
  '["temples","history"]', '["en","km"]', 'available', 'admin', NOW()
);
```

### Step 4: Start the Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Telegram Bot initialized successfully
```

### Step 5: Test the Bot

1. Open Telegram
2. Search for your bot (or use the bot link)
3. Send `/start`
4. You should see:
```
🎯 Welcome, Test Guide!

You are registered as a Tour Guide.
Current Status: available

Use the commands below to manage your availability:
```

5. Try the keyboard buttons:
   - Click "✅ Available"
   - Click "❌ Busy"
   - Click "📊 Status"

## 🧪 Testing

Run the test script to verify everything is working:

```bash
npm run test:telegram
```

Expected output:
```
🤖 Testing Telegram Bot Service...

1️⃣ Testing database connection...
✅ Database connected

2️⃣ Checking bot initialization...
✅ Telegram Bot is initialized and ready

3️⃣ Checking for registered guides...
✅ Found 1 guide(s):
   - Test Guide (Telegram ID: 123456789, Status: available)

4️⃣ Checking for registered drivers...
⚠️  No drivers found in database

✅ Telegram Bot Service test completed!
```

## 📱 Bot Commands Reference

| Command | What It Does |
|---------|--------------|
| `/start` | Shows welcome message and keyboard |
| `/status` | Shows your current status and stats |
| `/available` | Marks you as available |
| `/busy` | Marks you as unavailable |

## 🔧 Troubleshooting

### "You are not registered in our system"

**Problem:** Your Telegram ID is not in the database.

**Solution:**
1. Get your Telegram ID from @userinfobot
2. Add it to the database using the seed script or SQL
3. Send `/start` again

### Bot Not Responding

**Problem:** Bot is not initialized.

**Solution:**
1. Check if `TELEGRAM_BOT_TOKEN` is in `.env`
2. Restart the backend server
3. Check server logs for errors

### Status Not Updating

**Problem:** Database connection issue.

**Solution:**
1. Check database connection: `npm run db:test`
2. Verify the guides/transportation table exists
3. Check server logs for database errors

## 📊 Verify Status Updates

After clicking buttons in Telegram, verify the database:

```sql
-- Check guide status
SELECT name, status, last_status_update 
FROM guides 
WHERE telegram_user_id = 'YOUR_TELEGRAM_ID';

-- Check driver status
SELECT driver_name, status, last_status_update 
FROM transportation 
WHERE telegram_user_id = 'YOUR_TELEGRAM_ID';
```

## 🎯 Next Steps

1. ✅ Bot is working? Great!
2. Create more test guides/drivers
3. Test the webhook endpoints
4. Integrate with the booking system
5. Test booking notifications

## 📚 Full Documentation

For complete documentation, see: `backend/docs/TELEGRAM_BOT.md`

## 🆘 Need Help?

- Check server logs: Look for "Telegram Bot" messages
- Run test script: `npm run test:telegram`
- Review the full documentation
- Check the requirements: `.kiro/specs/derlg-tourism-platform/requirements.md`
