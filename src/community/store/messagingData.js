export const currentUser = {
  id: 1,
  name: "You",
  avatar: "https://i.pravatar.cc/150?img=11"
};

export const mockConversations = [
  // === DIRECT MESSAGES ===
  {
    id: 1,
    type: "direct",
    participants: [
      currentUser,
      { id: 2, name: "David Miller", avatar: "https://i.pravatar.cc/150?img=2", online: true }
    ],
    lastMessage: {
      text: "See you Sunday!",
      timestamp: "2026-04-30T08:30:00Z",
      senderId: 2
    },
    unreadCount: 2
  },
  {
    id: 2,
    type: "direct",
    participants: [
      currentUser,
      { id: 3, name: "Grace Hall", avatar: "https://i.pravatar.cc/150?img=3", online: false, lastSeen: "2026-04-30T10:15:00Z" }
    ],
    lastMessage: {
      text: "Thanks for the help",
      timestamp: "2026-04-29T14:20:00Z",
      senderId: 1
    },
    unreadCount: 0
  },
  {
    id: 3,
    type: "direct",
    participants: [
      currentUser,
      { id: 4, name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=4", online: true }
    ],
    lastMessage: {
      text: "Can you review this PR?",
      timestamp: "2026-04-30T13:45:00Z",
      senderId: 4
    },
    unreadCount: 1
  },
  {
    id: 4,
    type: "direct",
    participants: [
      currentUser,
      { id: 5, name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=5", online: false, lastSeen: "2026-04-29T22:10:00Z" }
    ],
    lastMessage: {
      text: "Happy birthday! 🎉",
      timestamp: "2026-04-28T09:00:00Z",
      senderId: 1
    },
    unreadCount: 0
  },
  {
    id: 5,
    type: "direct",
    participants: [
      currentUser,
      { id: 6, name: "James Rodriguez", avatar: "https://i.pravatar.cc/150?img=6", online: false, lastSeen: "2026-04-30T11:30:00Z" }
    ],
    lastMessage: {
      text: "Meeting moved to 3pm",
      timestamp: "2026-04-30T11:25:00Z",
      senderId: 6
    },
    unreadCount: 0
  },
  {
    id: 6,
    type: "direct",
    participants: [
      currentUser,
      { id: 7, name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=1", online: true }
    ],
    lastMessage: {
      text: "The design looks amazing",
      timestamp: "2026-04-30T15:10:00Z",
      senderId: 7
    },
    unreadCount: 0
  },
  {
    id: 7,
    type: "direct",
    participants: [
      currentUser,
      { id: 8, name: "Alex Thompson", avatar: "https://i.pravatar.cc/150?img=8", online: false, lastSeen: "2026-04-27T18:00:00Z" }
    ],
    lastMessage: {
      text: "Let me know when you're free",
      timestamp: "2026-04-27T17:45:00Z",
      senderId: 8
    },
    unreadCount: 0
  },

  // === GROUP CHATS ===
  {
    id: 8,
    type: "group",
    name: "Worship Team",
    avatar: "https://i.pravatar.cc/150?img=20",
    participants: [
      { ...currentUser, role: 'admin' },
      { id: 2, name: "David Miller", avatar: "https://i.pravatar.cc/150?img=2", role: 'admin' },
      { id: 3, name: "Grace Hall", avatar: "https://i.pravatar.cc/150?img=3", role: 'member' },
      { id: 9, name: "John Smith", avatar: "https://i.pravatar.cc/150?img=9", role: 'member' }
    ],
    createdBy: 2,
    createdAt: '2026-03-15T10:00:00Z',
    lastMessage: {
      text: "Grace: Practice at 6pm tomorrow",
      timestamp: "2026-04-30T10:15:00Z",
      senderId: 3
    },
    unreadCount: 5
  },
  {
    id: 9,
    type: "group",
    name: "Bible Study Group",
    avatar: "https://i.pravatar.cc/150?img=21",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 10, name: "Mary Jane", avatar: "https://i.pravatar.cc/150?img=10", role: 'admin' },
      { id: 11, name: "Peter Parker", avatar: "https://i.pravatar.cc/150?img=12", role: 'member' },
      { id: 12, name: "Lisa Brown", avatar: "https://i.pravatar.cc/150?img=13", role: 'member' }
    ],
    createdBy: 10,
    createdAt: '2026-02-20T14:00:00Z',
    lastMessage: {
      text: "You: I'll bring the snacks",
      timestamp: "2026-04-28T18:45:00Z",
      senderId: 1
    },
    unreadCount: 0
  },
  {
    id: 10,
    type: "group",
    name: "Design Team",
    avatar: "https://i.pravatar.cc/150?img=22",
    participants: [
      { ...currentUser, role: 'admin' },
      { id: 7, name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=1', role: 'admin' },
      { id: 3, name: 'Grace Hall', avatar: 'https://i.pravatar.cc/150?img=3', role: 'member' },
      { id: 4, name: 'Mike Chen', avatar: 'https://i.pravatar.cc/150?img=4', role: 'member' },
      { id: 13, name: 'Rachel Green', avatar: 'https://i.pravatar.cc/150?img=14', role: 'member' }
    ],
    createdBy: 7,
    createdAt: '2026-04-01T10:00:00Z',
    lastMessage: { text: 'Mike: Got it', timestamp: '2026-04-30T14:30:00Z', senderId: 4 },
    unreadCount: 2
  },
  {
    id: 11,
    type: "group",
    name: "Product Launch Q2",
    avatar: "https://i.pravatar.cc/150?img=23",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 2, name: "David Miller", avatar: "https://i.pravatar.cc/150?img=2", role: 'admin' },
      { id: 4, name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=4", role: 'admin' },
      { id: 6, name: "James Rodriguez", avatar: "https://i.pravatar.cc/150?img=6", role: 'member' },
      { id: 14, name: "Tom Hardy", avatar: "https://i.pravatar.cc/150?img=15", role: 'member' }
    ],
    createdBy: 2,
    createdAt: '2026-04-05T09:00:00Z',
    lastMessage: { text: "James: Assets are ready", timestamp: '2026-04-30T16:00:00Z', senderId: 6 },
    unreadCount: 3
  },
  {
    id: 12,
    type: "group",
    name: "Book Club 📚",
    avatar: "https://i.pravatar.cc/150?img=24",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 5, name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=5", role: 'admin' },
      { id: 12, name: "Lisa Brown", avatar: "https://i.pravatar.cc/150?img=13", role: 'member' },
      { id: 15, name: "Anna Davis", avatar: "https://i.pravatar.cc/150?img=16", role: 'member' }
    ],
    createdBy: 5,
    createdAt: '2026-03-01T12:00:00Z',
    lastMessage: { text: "Anna: Next book is 'Atomic Habits'", timestamp: '2026-04-29T20:15:00Z', senderId: 15 },
    unreadCount: 0
  },
  {
    id: 13,
    type: "group",
    name: "Weekend Hikers",
    avatar: "https://i.pravatar.cc/150?img=25",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 8, name: "Alex Thompson", avatar: "https://i.pravatar.cc/150?img=8", role: 'admin' },
      { id: 9, name: "John Smith", avatar: "https://i.pravatar.cc/150?img=9", role: 'member' },
      { id: 14, name: "Tom Hardy", avatar: "https://i.pravatar.cc/150?img=15", role: 'member' }
    ],
    createdBy: 8,
    createdAt: '2026-01-10T08:00:00Z',
    lastMessage: { text: "John: Weather looks good for Saturday", timestamp: '2026-04-30T07:20:00Z', senderId: 9 },
    unreadCount: 1
  },
  {
    id: 14,
    type: "group",
    name: "Family Group",
    avatar: "https://i.pravatar.cc/150?img=26",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 16, name: "Mom", avatar: "https://i.pravatar.cc/150?img=17", role: 'admin' },
      { id: 17, name: "Dad", avatar: "https://i.pravatar.cc/150?img=18", role: 'member' },
      { id: 18, name: "Sister Kate", avatar: "https://i.pravatar.cc/150?img=19", role: 'member' }
    ],
    createdBy: 16,
    createdAt: '2025-12-25T00:00:00Z',
    lastMessage: { text: "Mom: Dinner at 7?", timestamp: '2026-04-30T17:45:00Z', senderId: 16 },
    unreadCount: 4
  },
  {
    id: 15,
    type: "group",
    name: "Dev Standup",
    avatar: "https://i.pravatar.cc/150?img=27",
    participants: [
      { ...currentUser, role: 'member' },
      { id: 4, name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=4", role: 'admin' },
      { id: 6, name: "James Rodriguez", avatar: "https://i.pravatar.cc/150?img=6", role: 'member' },
      { id: 19, name: "Chris Evans", avatar: "https://i.pravatar.cc/150?img=29", role: 'member' }
    ],
    createdBy: 4,
    createdAt: '2026-04-15T09:00:00Z',
    lastMessage: { text: "Chris: Deployment done", timestamp: '2026-04-30T12:30:00Z', senderId: 19 },
    unreadCount: 0
  }
];

export const mockMessages = {
  1: [
    { id: 1, senderId: 2, text: "Hey, are you coming to service?", timestamp: "2026-04-30T08:15:00Z" },
    { id: 2, senderId: 1, text: "Yes! I'll be there", timestamp: "2026-04-30T08:16:00Z" },
    { id: 3, senderId: 2, text: "See you Sunday!", timestamp: "2026-04-30T08:30:00Z" },
  ],
  2: [
    { id: 1, senderId: 3, text: "Can you send me the notes from last week?", timestamp: "2026-04-29T14:15:00Z" },
    { id: 2, senderId: 1, text: "Thanks for the help", timestamp: "2026-04-29T14:20:00Z" },
  ],
  3: [
    { id: 1, senderId: 4, text: "Hey, quick question", timestamp: "2026-04-30T13:40:00Z" },
    { id: 2, senderId: 4, text: "Can you review this PR?", timestamp: "2026-04-30T13:45:00Z" },
  ],
  6: [
    { id: 1, senderId: 7, text: "Just saw the new mockups", timestamp: "2026-04-30T15:05:00Z" },
    { id: 2, senderId: 7, text: "The design looks amazing", timestamp: "2026-04-30T15:10:00Z" },
  ],
  8: [
    { id: 1, senderId: 2, text: "Team, rehearsal moved to 7pm", timestamp: "2026-04-30T09:00:00Z" },
    { id: 2, senderId: 3, text: "Practice at 6pm tomorrow", timestamp: "2026-04-30T10:15:00Z" },
    { id: 3, senderId: 9, text: "I'll bring my guitar", timestamp: "2026-04-30T10:20:00Z" },
  ],
  9: [
    { id: 1, senderId: 10, text: "Who's hosting this week?", timestamp: "2026-04-28T18:30:00Z" },
    { id: 2, senderId: 1, text: "I'll bring the snacks", timestamp: "2026-04-28T18:45:00Z" },
  ],
  10: [
    { id: 1, senderId: 7, text: "Updated the Figma file", timestamp: "2026-04-30T14:00:00Z" },
    { id: 2, senderId: 3, text: "Looking good!", timestamp: "2026-04-30T14:15:00Z" },
    { id: 3, senderId: 4, text: "Got it", timestamp: "2026-04-30T14:30:00Z" },
  ],
  11: [
    { id: 1, senderId: 2, text: "Launch date confirmed: May 15", timestamp: "2026-04-30T15:30:00Z" },
    { id: 2, senderId: 6, text: "Assets are ready", timestamp: "2026-04-30T16:00:00Z" },
  ],
  14: [
    { id: 1, senderId: 16, text: "Don't forget Sunday dinner", timestamp: "2026-04-30T17:30:00Z" },
    { id: 2, senderId: 16, text: "Dinner at 7?", timestamp: "2026-04-30T17:45:00Z" },
  ],
  15: [
    { id: 1, senderId: 4, text: "Morning! Blockers?", timestamp: "2026-04-30T09:00:00Z" },
    { id: 2, senderId: 19, text: "Deployment done", timestamp: "2026-04-30T12:30:00Z" },
  ]
};