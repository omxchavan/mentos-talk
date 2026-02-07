# MentorConnect

A hybrid mentoring platform where mentees can find and chat with human mentors, rate and review them, and receive AI-powered assistance from Google Gemini.

## 🚀 Features

- **Real-time Chat**: Powered by Pusher Channels for instant messaging
- **AI Assistant**: Google Gemini integration for AI-powered mentoring
- **Mentor Discovery**: Find and connect with mentors
- **Reviews & Ratings**: Rate and review mentors
- **User Authentication**: Secure auth with Clerk
- **MongoDB Database**: Scalable data storage

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Clerk account
- Google Gemini API key
- Pusher Channels account

## 🛠️ Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mentos-talk
npm install
```

### 2. Environment Variables

Create a `.env` file with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Pusher Channels
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

### 3. Pusher Setup

See [PUSHER_SETUP.md](./PUSHER_SETUP.md) for detailed Pusher configuration instructions.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 🚢 Deploy on Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

**Important**: Pusher Channels works seamlessly with Vercel's serverless architecture, unlike Socket.IO.

## 📁 Project Structure

```
mentos-talk/
├── src/app/              # Next.js app router pages
├── components/           # React components
├── lib/                  # Utility functions
├── models/              # MongoDB models
├── types/               # TypeScript types
└── public/              # Static assets
```

## 🔑 Key Components

- **RealtimeChat**: Real-time messaging component using Pusher
- **ChatUI**: Generic chat interface component
- **LoadingSpinner**: Loading state component

## 📚 Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Real-time**: Pusher Channels
- **AI**: Google Gemini
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Pusher Channels Docs](https://pusher.com/docs/channels/)
- [Clerk Documentation](https://clerk.com/docs)
- [Google Gemini API](https://ai.google.dev/)

## 📄 License

This project is licensed under the MIT License.
