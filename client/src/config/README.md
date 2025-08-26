# Configuration Files

## Admin Configuration (`admin.ts`)

This file contains the admin contact information displayed to users when they need help with password resets or other support issues.

### Configuration Options

- **email**: Primary admin email address
- **phone**: Primary admin phone number
- **supportHours**: Available support hours
- **liveChatAvailable**: Whether live chat is available
- **alternativeContact**: Backup contact information
- **socialMedia**: Social media support channels
- **emergency**: Emergency contact information (optional)

### Usage

The admin configuration is used in:
- Forgot Password page (`/forgot-password`)
- Any other support-related components

### Updating Contact Information

To update admin contact details:

1. Edit `client/src/config/admin.ts`
2. Update the relevant fields in the `adminConfig` object
3. The changes will be reflected automatically in all components using this configuration

### Example

```typescript
export const adminConfig = {
  email: 'admin@yourcompany.com',
  phone: '+1 (555) 123-4567',
  supportHours: '9 AM - 5 PM EST',
  liveChatAvailable: true,
  // ... other options
};
```

This centralized approach makes it easy to maintain consistent contact information across the application.
