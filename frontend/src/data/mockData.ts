import { Article, Ticket, Message, User, Category } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'student-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@westcliff.edu',
    role: 'STUDENT',
    avatarUrl: undefined,
  },
  {
    id: 'staff-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@westcliff.edu',
    role: 'STAFF',
    avatarUrl: undefined,
  },
  {
    id: 'staff-2',
    name: 'Michael Roberts',
    email: 'michael.roberts@westcliff.edu',
    role: 'STAFF',
    avatarUrl: undefined,
  },
];

// Category Icons mapping
export const categoryIcons: Record<Category, string> = {
  'Information Technology': '💻',
  'Learning Technologies': '📚',
  'Student Services': '🎓',
  'International Affairs': '🌍',
  'Registrar': '📋',
  'Student Accounts': '💳',
  'Financial Aid': '💰',
  'Alumni Affairs and Career Services': '🤝',
  'Military / Veterans': '🎖️',
  'Student Life': '🏠',
  'Learning Experience Design (LXD) Team': '🎨',
};

// Mock Articles
export const mockArticles: Article[] = [
  {
    id: 'art-1',
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
    updatedAt: '2024-01-15',
  },
  {
    id: 'art-2',
    title: 'Signing into Terra Dotta — Step-by-step',
    category: 'International Affairs',
    summary: 'Complete guide to accessing Terra Dotta with your Westcliff account.',
    content: `# Signing into Terra Dotta

## First-Time Login

1. Visit the Terra Dotta portal
2. Click "Sign In with SSO"
3. Enter your Westcliff email
4. Complete authentication

## Troubleshooting

If you experience issues:
- Clear your browser cache
- Try a different browser
- Contact IT support`,
    tags: ['terra dotta', 'login', 'international', 'sso'],
    updatedAt: '2024-01-10',
  },
  {
    id: 'art-3',
    title: 'CPT FAQs',
    category: 'International Affairs',
    summary: 'Frequently asked questions about Curricular Practical Training (CPT).',
    content: `# CPT Frequently Asked Questions

## What is CPT?
Curricular Practical Training (CPT) is a type of work authorization for F-1 students.

## Eligibility
- Must be in valid F-1 status
- Must have been enrolled for one academic year
- Employment must be related to your field of study

## How to Apply
1. Secure an internship offer
2. Submit CPT application through Terra Dotta
3. Wait for DSO approval
4. Begin work only after receiving updated I-20`,
    tags: ['cpt', 'work authorization', 'international', 'employment'],
    updatedAt: '2024-01-12',
  },
  {
    id: 'art-4',
    title: 'CPT Applications Guideline',
    category: 'International Affairs',
    summary: 'Detailed guidelines for submitting your CPT application.',
    content: `# CPT Application Guidelines

## Required Documents
- Offer letter from employer
- CPT request form
- Academic advisor approval

## Timeline
Apply at least 2 weeks before your intended start date.`,
    tags: ['cpt', 'application', 'international'],
    updatedAt: '2024-01-08',
  },
  {
    id: 'art-5',
    title: 'OPT Application Guideline',
    category: 'International Affairs',
    summary: 'Complete guide to applying for Optional Practical Training (OPT).',
    content: `# OPT Application Guidelines

## Overview
OPT allows F-1 students to work in their field of study for up to 12 months after graduation.

## Application Timeline
Apply no earlier than 90 days before graduation and no later than 60 days after.`,
    tags: ['opt', 'post-graduation', 'international', 'employment'],
    updatedAt: '2024-01-05',
  },
  {
    id: 'art-6',
    title: 'MyWestcliff (Okta/SSO) or Gmail Password Reset',
    category: 'Information Technology',
    summary: 'How to reset your Westcliff account password.',
    content: `# Password Reset Guide

## Self-Service Reset
1. Go to password.westcliff.edu
2. Click "Forgot Password"
3. Enter your Westcliff email
4. Follow the verification steps
5. Create a new password

## Requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one number
- At least one special character`,
    tags: ['password', 'reset', 'okta', 'sso', 'security'],
    updatedAt: '2024-01-20',
  },
  {
    id: 'art-7',
    title: 'Payment Plans',
    category: 'Student Accounts',
    summary: 'Understanding and enrolling in Westcliff payment plans.',
    content: `# Payment Plans at Westcliff

## Available Plans
- Monthly Payment Plan
- Semester Payment Plan
- Annual Payment Plan

## How to Enroll
1. Log into Student Portal
2. Navigate to Financial Services
3. Select Payment Plans
4. Choose your preferred plan
5. Complete enrollment`,
    tags: ['payment', 'tuition', 'financial', 'billing'],
    updatedAt: '2024-01-18',
  },
  {
    id: 'art-8',
    title: 'What is Global Academic Portal (GAP)?',
    category: 'Learning Technologies',
    summary: 'Introduction to the Global Academic Portal and its features.',
    content: `# Global Academic Portal (GAP)

## Overview
GAP is your one-stop platform for academic resources, course materials, and grades.

## Key Features
- Access course materials
- Submit assignments
- View grades
- Communicate with instructors
- Access library resources`,
    tags: ['gap', 'portal', 'learning', 'courses'],
    updatedAt: '2024-01-22',
  },
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    studentId: 'student-1',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.johnson@westcliff.edu',
    category: 'International Affairs',
    service: 'I-20 Request',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    summary: 'Need updated I-20 for visa renewal',
    description: 'My visa expires in 2 months and I need an updated I-20 document for my visa renewal appointment at the embassy.',
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-26T14:20:00Z',
    assigneeId: 'staff-1',
    assigneeName: 'Dr. Sarah Chen',
    attachments: [],
  },
  {
    id: 'ticket-2',
    studentId: 'student-1',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.johnson@westcliff.edu',
    category: 'Information Technology',
    service: 'Password Reset',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    summary: 'Cannot access MyWestcliff portal',
    description: 'I forgot my password and the reset link is not working. Please help me regain access.',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T11:45:00Z',
    assigneeId: 'staff-2',
    assigneeName: 'Michael Roberts',
    attachments: [],
  },
  {
    id: 'ticket-3',
    studentId: 'student-1',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.johnson@westcliff.edu',
    category: 'Student Accounts',
    service: 'Payment Plan',
    priority: 'LOW',
    status: 'NEW',
    summary: 'Question about payment plan options',
    description: 'I would like to know what payment plan options are available for the upcoming semester.',
    createdAt: '2024-01-28T16:00:00Z',
    updatedAt: '2024-01-28T16:00:00Z',
    attachments: [],
  },
  {
    id: 'ticket-4',
    studentId: 'student-1',
    studentName: 'Alex Johnson',
    studentEmail: 'alex.johnson@westcliff.edu',
    category: 'International Affairs',
    service: 'CPT Application',
    priority: 'HIGH',
    status: 'WAITING',
    summary: 'CPT approval pending - employer needs confirmation',
    description: 'I submitted my CPT application last week. My employer is asking for confirmation. How long does approval take?',
    createdAt: '2024-01-24T08:00:00Z',
    updatedAt: '2024-01-27T09:30:00Z',
    assigneeId: 'staff-1',
    assigneeName: 'Dr. Sarah Chen',
    attachments: [],
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    ticketId: 'ticket-1',
    senderRole: 'STUDENT',
    senderName: 'Alex Johnson',
    body: 'My visa expires in 2 months and I need an updated I-20 document for my visa renewal appointment at the embassy.',
    createdAt: '2024-01-25T10:30:00Z',
    isInternalNote: false,
  },
  {
    id: 'msg-2',
    ticketId: 'ticket-1',
    senderRole: 'AI',
    senderName: 'AI Assistant',
    body: 'I understand you need an updated I-20 for visa renewal. I\'ve categorized this as high priority. A staff member will review your request shortly.',
    createdAt: '2024-01-25T10:31:00Z',
    isInternalNote: false,
  },
  {
    id: 'msg-3',
    ticketId: 'ticket-1',
    senderRole: 'STAFF',
    senderName: 'Dr. Sarah Chen',
    body: 'Hi Alex, I\'m processing your I-20 request. Could you please confirm your current program and expected graduation date?',
    createdAt: '2024-01-26T09:00:00Z',
    isInternalNote: false,
  },
  {
    id: 'msg-4',
    ticketId: 'ticket-1',
    senderRole: 'STUDENT',
    senderName: 'Alex Johnson',
    body: 'I\'m in the MBA program, expected graduation May 2025.',
    createdAt: '2024-01-26T14:20:00Z',
    isInternalNote: false,
  },
  {
    id: 'msg-5',
    ticketId: 'ticket-1',
    senderRole: 'STAFF',
    senderName: 'Dr. Sarah Chen',
    body: 'Student has a strong academic record. Prioritizing this request.',
    createdAt: '2024-01-26T09:05:00Z',
    isInternalNote: true,
  },
  {
    id: 'msg-6',
    ticketId: 'ticket-2',
    senderRole: 'STUDENT',
    senderName: 'Alex Johnson',
    body: 'I forgot my password and the reset link is not working. Please help me regain access.',
    createdAt: '2024-01-20T09:15:00Z',
    isInternalNote: false,
  },
  {
    id: 'msg-7',
    ticketId: 'ticket-2',
    senderRole: 'STAFF',
    senderName: 'Michael Roberts',
    body: 'I\'ve reset your password. Please check your personal email for the temporary password and change it immediately upon login.',
    createdAt: '2024-01-20T11:45:00Z',
    isInternalNote: false,
  },
];

// Staff members for assignment
export const staffMembers = mockUsers.filter(u => u.role === 'STAFF');
