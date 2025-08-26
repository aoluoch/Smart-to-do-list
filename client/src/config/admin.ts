// Admin contact configuration
export const adminConfig = {
  email: 'admin@taskflow.com',
  phone: '+1 (555) 123-4567',
  supportHours: '9 AM - 5 PM EST',
  liveChatAvailable: true,
  alternativeContact: {
    email: 'support@taskflow.com',
    phone: '+1 (555) 123-4568',
  },
  // You can add more contact methods or update these as needed
  socialMedia: {
    twitter: '@TaskFlowSupport',
    linkedin: 'TaskFlow Support',
  },
  // Emergency contact (optional)
  emergency: {
    email: 'emergency@taskflow.com',
    phone: '+1 (555) 911-HELP',
  }
};

export const getAdminContactInfo = () => adminConfig;
