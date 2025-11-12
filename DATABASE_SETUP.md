## Database Setup Instructions

### Option 1: Using MySQL Command Line (Recommended)

1. Open your terminal/command prompt and connect to MySQL:
```bash
C:\xampp\mysql\bin\mysql.exe -u root -p
```
Enter password: `12345`

2. Execute the SQL script:
```sql
source d:\Derlg\DerLg-Startup\create_database.sql
```

Or simply copy and paste all the SQL content from `create_database.sql` into the MySQL prompt.

---

### Option 2: Using MySQL Client GUI Tools

You can also import the `create_database.sql` file using:
- **MySQL Workbench**
- **HeidiSQL**
- **phpMyAdmin**

---

### Option 3: Using a Batch Script (Windows CMD)

Create a file called `run_sql.cmd` in the project root with this content:

```batch
@echo off
C:\xampp\mysql\bin\mysql.exe -u root -p12345 < d:\Derlg\DerLg-Startup\create_database.sql
echo Database created successfully!
pause
```

Then run: `run_sql.cmd`

---

### Verification

After execution, verify the database was created:

```sql
SHOW DATABASES;
USE derlg_startup;
SHOW TABLES;
```

You should see 14 tables:
1. users
2. hotels
3. rooms
4. bookings
5. payment_transactions
6. tours
7. events
8. reviews
9. guides
10. transportation
11. promo_codes
12. messages
13. wishlists
14. ai_conversations

---

### Database Structure

**Database Name:** `derlg_startup`

**Tables Summary:**
- **users**: User accounts (super_admin, admin, tourist)
- **hotels**: Hotel listings with details
- **rooms**: Room types in hotels
- **bookings**: Room booking records
- **payment_transactions**: Payment records with escrow system
- **tours**: Tour packages
- **events**: Events and festivals
- **reviews**: User reviews for hotels/tours
- **guides**: Tour guides management
- **transportation**: Transportation/drivers management
- **promo_codes**: Discount codes
- **messages**: Messaging between users and hotel staff
- **wishlists**: User wishlists
- **ai_conversations**: AI chat history

---

### Key Features

✅ UUID primary keys for security and scalability
✅ JSON fields for flexible data storage
✅ Foreign key relationships with CASCADE operations
✅ Comprehensive indexes for query optimization
✅ ENUM types for restricted values
✅ Audit timestamps (created_at, updated_at)
✅ UTF8MB4 encoding for international characters

---

### Notes

- The script creates the database from scratch
- If database already exists, it will use the existing one
- All tables use InnoDB engine for ACID compliance
- Indexes are optimized for the queries defined in migrations
