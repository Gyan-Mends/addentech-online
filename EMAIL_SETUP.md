# Email Notification Setup for Memo System

This document explains how to configure email notifications for the memo system.

## 🚀 **NEW: Automatic Email Notifications**
- ✅ **Email notifications are now AUTOMATICALLY enabled** for all memos
- ✅ **No checkbox needed** - all memos will send notifications
- ✅ **Both TO and CC recipients** receive professional email notifications

## 📧 **Email Service Options**

### **Option 1: Simple API Services (Recommended - No Password Needed!)**

#### **A. SendGrid (Easiest)**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

**Setup Steps:**
1. Sign up at [SendGrid.com](https://sendgrid.com) (Free tier: 100 emails/day)
2. Get your API key from dashboard
3. Add to `.env` file - **No passwords needed!**

#### **B. Mailgun (Also Easy)**
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.mailgun.org
```

**Setup Steps:**
1. Sign up at [Mailgun.com](https://mailgun.com) (Free tier: 300 emails/day)
2. Get API key and domain from dashboard
3. Add to `.env` file - **No passwords needed!**

### **Option 2: Traditional SMTP (Requires Password)**

Create a `.env` file with these variables:

```env
# Traditional SMTP Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔧 **Complete .env Configuration**

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/addentech-online

# EMAIL OPTION 1: SendGrid (Recommended - Simple!)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# EMAIL OPTION 2: Mailgun (Also Simple!)
# EMAIL_SERVICE=mailgun
# MAILGUN_API_KEY=your-mailgun-api-key
# MAILGUN_DOMAIN=your-domain.mailgun.org

# EMAIL OPTION 3: Traditional SMTP (More Complex)
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Session Configuration
SESSION_SECRET=addentech-session-secret-key-2024

# Application Settings
NODE_ENV=development
PORT=3000
```

## ✨ **Benefits of API Services over SMTP:**

| Feature | API Services (SendGrid/Mailgun) | Traditional SMTP |
|---------|----------------------------------|------------------|
| **Setup Complexity** | ⭐ Simple (just API key) | ⭐⭐⭐ Complex (passwords, 2FA, etc.) |
| **Security** | ⭐⭐⭐ Very Secure | ⭐⭐ Requires password management |
| **Reliability** | ⭐⭐⭐ Enterprise grade | ⭐⭐ Depends on email provider |
| **Deliverability** | ⭐⭐⭐ Optimized for delivery | ⭐⭐ Basic |
| **Free Tier** | ✅ 100-300 emails/day | ✅ Unlimited but complex |
| **Analytics** | ✅ Detailed delivery stats | ❌ Basic |

## 🎯 **Recommendation**

**Use SendGrid or Mailgun** - they're much simpler and more reliable than traditional SMTP:

1. **No passwords** to manage
2. **Better delivery** rates  
3. **Simple setup** - just an API key
4. **Free tiers** available
5. **Enterprise-grade** reliability

## Features

### Email Notifications
When any memo is created:
- ✅ **TO recipient** automatically receives email notification
- ✅ **CC recipient** automatically receives email notification  
- ✅ **No checkbox needed** - always enabled
- ✅ Emails include all memo details (subject, from, date, type, etc.)
- ✅ Both HTML and plain text versions are sent

### Email Content
- **Subject**: "New Memo: [Subject] - [Reference Number]"
- **From**: Shows actual sender's name
- **Reply-To**: Directs to sender's email
- **Content**: Complete memo details including:
  - Reference number
  - Subject
  - Sender information
  - Memo date and type
  - Due date (if applicable)
  - Follow-up frequency (if applicable)
  - Remarks (if any)

## Testing

To test email configuration:
1. Set up your chosen email service in `.env`
2. Create a test memo
3. Check server logs for email sending status
4. Verify recipients receive the notification emails

## Troubleshooting

### SendGrid/Mailgun Issues
1. **"Invalid API key"**
   - Double-check your API key
   - Ensure it's copied correctly without extra spaces
   - Verify the API key is active

2. **"Domain not verified"** (Mailgun)
   - Complete domain verification in Mailgun dashboard
   - Or use their sandbox domain for testing

### SMTP Issues (if using traditional method)
1. **"Invalid login"**
   - Check username/password
   - For Gmail, use app password, not regular password
   - Verify 2FA is enabled for Gmail

## Security Notes

- ✅ **API keys are safer** than passwords
- ✅ **Never commit `.env` file** to version control
- ✅ **Rotate API keys** periodically
- ✅ **Monitor usage** to prevent abuse 