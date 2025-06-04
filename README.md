# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Environment Configuration

### SMTP Email Configuration

The memorandum system requires SMTP configuration for sending email notifications. Create a `.env` file in the root directory with the following variables:

```env
# SMTP Configuration for Email Functionality
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/your-database-name
```

#### Gmail Setup Instructions:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASSWORD` (not your regular Gmail password)

#### Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587 or 465
- **Custom SMTP**: Use your provider's SMTP settings

### Memorandum System Features

The memorandum system includes:
- **Role-based visibility**: Users can only see memos they're involved in (sender, recipient, or CC'd), except admins and managers who see all memos
- **Automatic email notifications**: Emails are sent to recipients and CC'd users when memos are created or updated
- **Department-based user filtering**: When selecting recipients, users are filtered by the selected department
- **Auto-populated sender information**: The logged-in user's department and name are automatically used as the sender

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
