/**
 * Database Seed Script for Knowledge Base Articles
 * 
 * Populates the articles collection with 8 seed articles.
 * Idempotent - uses upsert by title to avoid duplicates.
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import { Article, User, UserRole } from '../models/index.js';
import { env } from '../config/env.js';

// Seed articles data
const seedArticles = [
  {
    title: 'Locate and Download Your I-20 on Terra Dotta',
    category: 'International Affairs',
    summary: 'Step-by-step guide to find and download your I-20 document from Terra Dotta.',
    content: `# How to Download Your I-20

## Overview
Your I-20 is an essential document for international students. This guide will walk you through the process of downloading it from Terra Dotta.

## Steps

### 1. Log into Terra Dotta
- Go to [Terra Dotta Portal](https://westcliff.terradotta.com)
- Sign in with your Westcliff credentials

### 2. Navigate to Documents
- Click on "My Documents" in the left sidebar
- Select "Immigration Documents"

### 3. Find Your I-20
- Look for documents labeled "I-20" or "Certificate of Eligibility"
- Click the download icon next to the document

### 4. Save and Print
- Save the PDF to your device
- Print if needed for travel or visa appointments

## Need Help?
If you cannot find your I-20, please contact the International Affairs office.`,
    tags: ['i-20', 'immigration', 'terra dotta', 'international'],
  },
  {
    title: 'Signing into Terra Dotta — Step-by-step',
    category: 'International Affairs',
    summary: 'Complete guide to accessing Terra Dotta with your Westcliff account.',
    content: `# Signing into Terra Dotta

## First-Time Login

1. Visit the Terra Dotta portal at https://westcliff.terradotta.com
2. Click "Sign In with SSO"
3. Enter your Westcliff email
4. Complete authentication with your password

## Troubleshooting

If you experience issues:
- Clear your browser cache and cookies
- Try a different browser (Chrome or Firefox recommended)
- Ensure you're using your full Westcliff email address
- Contact IT support if problems persist

## Security Tips
- Never share your login credentials
- Always log out when finished
- Use a secure internet connection`,
    tags: ['terra dotta', 'login', 'international', 'sso'],
  },
  {
    title: 'CPT FAQs',
    category: 'International Affairs',
    summary: 'Frequently asked questions about Curricular Practical Training (CPT).',
    content: `# CPT Frequently Asked Questions

## What is CPT?
Curricular Practical Training (CPT) is a type of work authorization for F-1 students that allows them to gain practical experience in their field of study.

## Eligibility Requirements
- Must be in valid F-1 status
- Must have been enrolled full-time for one academic year (two semesters)
- Employment must be directly related to your major field of study
- Must have a job offer before applying

## Types of CPT
- **Part-time CPT**: 20 hours or less per week during the academic term
- **Full-time CPT**: More than 20 hours per week (typically during breaks)

## How to Apply
1. Secure an internship or job offer related to your field of study
2. Submit CPT application through Terra Dotta
3. Obtain approval from your academic advisor
4. Wait for DSO (Designated School Official) approval
5. Receive updated I-20 with CPT authorization
6. Begin work only after receiving the updated I-20

## Important Notes
- Using 12 months or more of full-time CPT will make you ineligible for OPT
- You must maintain your F-1 status throughout
- Employment must align with your degree program

## Questions?
Contact the International Student Services office for assistance.`,
    tags: ['cpt', 'work authorization', 'international', 'employment'],
  },
  {
    title: 'CPT Applications Guideline',
    category: 'International Affairs',
    summary: 'Detailed guidelines for submitting your CPT application.',
    content: `# CPT Application Guidelines

## Required Documents
1. **Offer letter from employer** - Must include:
   - Company letterhead
   - Job title and description
   - Start and end dates
   - Number of hours per week
   - Company signature

2. **CPT request form** - Available on Terra Dotta

3. **Academic advisor approval** - Must confirm the internship relates to your field of study

## Application Timeline
- Apply at least 2-3 weeks before your intended start date
- Do not begin work until you receive your updated I-20
- Processing typically takes 5-7 business days

## Submission Process
1. Log into Terra Dotta
2. Complete the CPT application form
3. Upload all required documents
4. Submit for academic advisor review
5. Wait for DSO processing
6. Download your updated I-20

## After Approval
- Save your CPT authorization I-20
- Provide a copy to your employer
- Report any changes to your employment
- Complete the CPT evaluation form at the end

## Need Help?
Email international@westcliff.edu or visit the International Affairs office.`,
    tags: ['cpt', 'application', 'international'],
  },
  {
    title: 'OPT Application Guideline',
    category: 'International Affairs',
    summary: 'Complete guide to applying for Optional Practical Training (OPT).',
    content: `# OPT Application Guidelines

## Overview
Optional Practical Training (OPT) allows F-1 students to work in their field of study for up to 12 months after graduation. STEM students may be eligible for a 24-month extension.

## Eligibility
- Must be in valid F-1 status
- Must have completed at least one academic year
- Must apply before completing your program or within 60 days after completion

## Application Timeline
- Apply no earlier than 90 days before program completion
- Apply no later than 60 days after program completion
- Processing takes 3-5 months

## Required Documents
1. Form I-765 (Application for Employment Authorization)
2. Two passport-style photos
3. Copy of all I-20s
4. Copy of I-94
5. Copy of passport and F-1 visa
6. Application fee ($410 as of 2024)

## Application Steps
1. Request OPT recommendation from DSO
2. Receive I-20 with OPT recommendation
3. Complete Form I-765
4. Mail application to USCIS
5. Wait for EAD card

## Important Dates
- OPT can begin as early as 60 days before program end date
- OPT ends 60 days after program end date if card not received
- You have 90 days maximum of unemployment

## STEM Extension
STEM degree holders may apply for 24-month extension. Requirements:
- Employer must be E-Verify enrolled
- Must apply before current OPT expires
- Complete Form I-983 (Training Plan)

## Questions?
Contact International Student Services for guidance throughout the process.`,
    tags: ['opt', 'post-graduation', 'international', 'employment'],
  },
  {
    title: 'MyWestcliff (Okta/SSO) or Gmail Password Reset',
    category: 'Information Technology',
    summary: 'How to reset your Westcliff account password.',
    content: `# Password Reset Guide

## Self-Service Password Reset

### Steps
1. Go to https://password.westcliff.edu
2. Click "Forgot Password" or "Reset Password"
3. Enter your Westcliff email address
4. Check your email for verification code
5. Enter the verification code
6. Create a new password
7. Confirm your new password

## Password Requirements
Your new password must meet these criteria:
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- Cannot be the same as your last 3 passwords
- Cannot contain your name or email

## What This Password Controls
Your Westcliff password gives you access to:
- MyWestcliff portal (Okta/SSO)
- Westcliff Gmail
- Canvas (via SSO)
- Library resources
- Student portal
- All other Westcliff online services

## Troubleshooting

**Not receiving reset email?**
- Check your spam/junk folder
- Verify you entered the correct email address
- Wait 5-10 minutes for the email to arrive

**Reset link expired?**
- Password reset links expire after 30 minutes
- Request a new reset link

**Still having issues?**
Contact IT Support:
- Email: support@westcliff.edu
- Phone: (949) 825-5200
- Live Chat: Available on MyWestcliff portal

## Security Tips
- Never share your password with anyone
- Change your password if you suspect it's been compromised
- Use a unique password (don't reuse passwords from other sites)
- Enable two-factor authentication when available
- Log out of shared computers`,
    tags: ['password', 'reset', 'okta', 'sso', 'security'],
  },
  {
    title: 'Payment Plans',
    category: 'Student Accounts',
    summary: 'Understanding and enrolling in Westcliff payment plans.',
    content: `# Payment Plans at Westcliff

## Available Payment Plans

### Monthly Payment Plan
- Spread tuition over 5 monthly payments
- $50 enrollment fee
- Automatic payments from checking/savings account
- Due on the 5th of each month

### Semester Payment Plan
- Two payments per semester
- $25 enrollment fee
- Due at start and midpoint of semester

### Annual Payment Plan
- Single payment for the entire academic year
- 2% discount on total tuition
- No enrollment fee
- Must be paid before classes begin

## How to Enroll

1. **Log into Student Portal**
   - Go to my.westcliff.edu
   - Sign in with your credentials

2. **Navigate to Financial Services**
   - Click on "Student Accounts"
   - Select "Payment Plans"

3. **Choose Your Preferred Plan**
   - Review available options
   - Compare fees and benefits
   - Consider your financial situation

4. **Set Up Payment Method**
   - Enter bank account information (for auto-pay)
   - Or credit card details
   - Verify payment information

5. **Complete Enrollment**
   - Review terms and conditions
   - Confirm enrollment
   - Print confirmation for your records

## Important Information

### Payment Methods Accepted
- Bank account (ACH) - Recommended
- Credit card (convenience fee applies)
- Debit card
- International wire transfer

### Late Payment Policy
- $50 late fee for missed payments
- Account hold after 2 missed payments
- Contact Student Accounts immediately if you anticipate payment difficulties

### Changing Your Plan
- Can change plans up to 2 weeks before semester starts
- Contact Student Accounts for modifications
- Some restrictions may apply

### Financial Aid & Payment Plans
- Financial aid can be used with payment plans
- Aid will be applied to your balance first
- Payment plan covers remaining balance

## Need Assistance?

**Student Accounts Office**
- Email: studentaccounts@westcliff.edu
- Phone: (949) 825-5200 ext. 123
- Office Hours: Monday-Friday, 9am-5pm PST
- Location: Administration Building, 2nd Floor

**Virtual Appointments**
Schedule a virtual consultation to discuss:
- Which payment plan is best for you
- Financial hardship options
- Payment schedule adjustments`,
    tags: ['payment', 'tuition', 'financial', 'billing'],
  },
  {
    title: 'What is Global Academic Portal (GAP)?',
    category: 'Learning Technologies',
    summary: 'Introduction to the Global Academic Portal and its features.',
    content: `# Global Academic Portal (GAP)

## Overview
The Global Academic Portal (GAP) is Westcliff University's comprehensive learning management system. It serves as your one-stop platform for all academic resources, course materials, and grade information.

## Accessing GAP
- **URL**: https://gap.westcliff.edu
- **Login**: Use your Westcliff email and password
- **Support**: Available 24/7

## Key Features

### Course Materials
- Access syllabus and course schedule
- Download lecture notes and presentations
- View required and recommended readings
- Access multimedia learning resources

### Assignment Submission
- Submit assignments electronically
- Track submission history
- Receive instant confirmation
- View feedback from instructors

### Grades and Progress
- View current grades for all courses
- Track assignment scores
- Monitor overall GPA
- Access grade reports

### Communication Tools
- Email instructors directly
- Participate in discussion boards
- Join virtual study groups
- Receive important announcements

### Library Resources
- Access digital library collections
- Search academic databases
- Request interlibrary loans
- Access research guides

### Calendar and Scheduling
- View important academic dates
- Set personal reminders
- Sync with external calendars
- Track assignment due dates

## Mobile Access
GAP is mobile-responsive and works on:
- Smartphones (iOS and Android)
- Tablets
- Laptops and desktops
- Any device with a web browser

## Best Practices

### For Students
- Log in at least once daily
- Enable email notifications
- Complete modules in order
- Participate in discussions
- Submit assignments early
- Save work frequently

### Technical Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection (minimum 5 Mbps recommended)
- Updated operating system
- JavaScript enabled
- Cookies enabled
- Pop-up blockers configured to allow GAP

## Troubleshooting

**Can't log in?**
1. Verify your credentials
2. Clear browser cache
3. Try incognito/private mode
4. Reset your password if needed

**Page not loading?**
1. Check your internet connection
2. Refresh the page
3. Clear browser cache and cookies
4. Try a different browser

**Assignment won't submit?**
1. Check file size (max 50MB)
2. Verify file format is accepted
3. Ensure deadline hasn't passed
4. Try uploading from different browser

## Getting Help

**Technical Support**
- Email: gap-support@westcliff.edu
- Phone: (949) 825-5200 ext. 456
- Live Chat: Available in GAP portal
- Available: 24/7

**Training Resources**
- Video tutorials in the Help section
- Student orientation webinars
- Quick reference guides (PDF)
- FAQ database

## Additional Features

### Collaboration Tools
- Group project workspaces
- Peer review system
- Video conferencing integration
- Shared document editing

### Progress Tracking
- Learning analytics dashboard
- Time spent on modules
- Engagement metrics
- Competency tracking

### Accessibility Features
- Screen reader compatible
- Keyboard navigation
- Closed captioning on videos
- Adjustable text size
- High contrast mode

GAP is continuously updated with new features and improvements based on student and faculty feedback. Check the "What's New" section regularly for the latest enhancements!`,
    tags: ['gap', 'portal', 'learning', 'courses', 'lms'],
  },
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create a system user for authoring articles
    let systemUser = await User.findOne({ email: 'system@westcliff.edu' });
    
    if (!systemUser) {
      console.log('Creating system user for article authorship...');
      systemUser = await User.create({
        googleId: 'system_author',
        email: 'system@westcliff.edu',
        name: 'Westcliff Knowledge Base',
        role: UserRole.STAFF,
      });
      console.log('System user created');
    }

    console.log('\nSeeding articles...');
    let insertedCount = 0;
    let updatedCount = 0;

    for (const articleData of seedArticles) {
      const result = await Article.findOneAndUpdate(
        { title: articleData.title }, // Find by title
        {
          ...articleData,
          authorId: systemUser._id,
          authorName: systemUser.name,
          isPublished: true, // All seed articles are published
          viewCount: 0,
        },
        {
          upsert: true, // Create if doesn't exist
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (result) {
        // Check if it was a new insert or update
        const existing = await Article.findOne({ 
          title: articleData.title,
          createdAt: { $lt: new Date(Date.now() - 1000) } // Created more than 1 second ago
        });
        
        if (existing) {
          updatedCount++;
          console.log(`  ✓ Updated: ${articleData.title}`);
        } else {
          insertedCount++;
          console.log(`  ✓ Inserted: ${articleData.title}`);
        }
      }
    }

    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log(`Total articles: ${seedArticles.length}`);
    console.log(`New articles inserted: ${insertedCount}`);
    console.log(`Existing articles updated: ${updatedCount}`);
    console.log('========================================\n');

    // Verify article count
    const totalArticles = await Article.countDocuments({ isPublished: true });
    console.log(`Total published articles in database: ${totalArticles}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the seed script
seedDatabase();
