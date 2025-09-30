require('dotenv').config();
const { sendNewEventNotification, verifyEmailConfiguration } = require('./services/emailService');

const testEvent = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Campus Tech Meetup 2024',
  description: 'Join us for an exciting tech networking event',
  detailedDescription: 'Connect with fellow tech enthusiasts, learn about the latest technologies, and network with industry professionals. Free pizza and refreshments will be provided!',
  date: new Date('2024-12-20T18:00:00Z'),
  location: 'Computer Science Building, Room 301',
  category: 'Tech',
  tags: ['networking', 'technology', 'meetup'],
  imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
  createdBy: {
    _id: '507f1f77bcf86cd799439012',
    fullName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu'
  }
};

const testUsers = [
  {
    email: process.env.TEST_EMAIL || 'test@example.com',
    fullName: 'Test Student'
  }
];

async function runTest() {
  console.log('🧪 Testing Email Notification System\n');

  console.log('Step 1: Verifying email configuration...');
  const config = await verifyEmailConfiguration();
  console.log('Configuration result:', config);

  if (!config.configured) {
    console.log('\n❌ Email is not configured. Please set up your .env file first.');
    console.log('Required variables: EMAIL_USER, EMAIL_PASSWORD');
    console.log('\nSee EMAIL_SETUP_GUIDE.md for detailed instructions.');
    return;
  }

  console.log('\n✅ Email configuration verified!\n');

  console.log('Step 2: Sending test notification email...');
  console.log('Test event:', testEvent.title);
  console.log('Recipients:', testUsers.map(u => u.email).join(', '));
  console.log('\nSending...\n');

  const result = await sendNewEventNotification(testEvent, testUsers);

  console.log('\n📊 Test Results:');
  console.log('----------------');
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log('Emails sent:', result.sent);
  console.log('Emails failed:', result.failed);
  console.log('Total recipients:', result.total);

  if (result.success && result.sent > 0) {
    console.log('\n✅ Test completed successfully!');
    console.log(`📧 Check the inbox for: ${testUsers[0].email}`);
  } else {
    console.log('\n❌ Test failed. Check the error messages above.');
  }
}

runTest().catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});

console.log('\n💡 Tip: Set TEST_EMAIL in your .env file to send to a different address');
console.log('Example: TEST_EMAIL=your-email@gmail.com\n');