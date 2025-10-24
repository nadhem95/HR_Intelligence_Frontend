// chatbot.service.ts
import { Injectable } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

// Animations for the chatbot
export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms', style({ opacity: 1 }))
  ])
]);

// Interface for response options
export interface ChatOption {
  text: string;
  icon: string;
  action?: string;
  url?: string;
  style: string;
  delay?: number; // in milliseconds
}

export interface Message {
  text?: string;
  html?: string; // to include links or other elements
  isBot: boolean;
  isLoading?: boolean;
}

// Interface for chatbot responses
export interface ChatResponse {
  title: string[];
  options: ChatOption[];
  tips?: string[]; // Optional property
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private chatResponses: Record<string, ChatResponse> = {
    welcome: {
      title: [
        "Hello 👋", 
        "I am your JOBCY application assistant",
        "How can I assist you today?"
      ],
      options: [
        { text: "Resume", icon: "📄", action: "cv", style: "primary" },
        { text: "Job Offers", icon: "💼", action: "jobs", style: "primary" },
        { text: "Interview Tips", icon: "💬", action: "advice", style: "primary" }
      ]
    },
    cv: {
      title: ["I can help you with your application documents"],
      options: [
        { text: "Resume Templates", icon: "🖋️", action: "templates", style: "secondary",url: "/resumebuilder" },
        { text: "Resume Tips", icon: "💡", action: "cvTips", style: "secondary" },
        { text: "Back", icon: "↩️", action: "welcome", style: "back" }
      ]
    },
    cvTips: {
      title: ["Tips for a perfect resume:"],
      tips: [
        "✅ Clear and professional structure",
        "📝 Tailor it to each job application",
        "🔍 Relevant keywords",
        "📏 1-2 pages maximum",
        "🧠 Be precise and honest"
      ],
      options: [
        { text: "Back", icon: "↩️", action: "cv", style: "back" }
      ]
    },
    advice: {
      title: ["Tips for your interviews:"],
      options: [
        { text: "Preparation", icon: "📚", action: "preparation", style: "secondary" },
        { text: "Common Questions", icon: "❓", action: "questions", style: "secondary" },
        { text: "Back", icon: "↩️", action: "welcome", style: "back" }
      ]
    },
    jobs: {
      title: ["Here are our available job offers"],
      options: [
        { text: "View all offers", icon: "🔍", url: "/offre", style: "secondary" },
        { text: "Back", icon: "↩️", action: "welcome", style: "back" }
      ]
    },
    preparation: {
      title: ["🧠 Being well-prepared for an interview is already 50% of success!"],
      tips: [
        "🔍 Research the company: website, social media, recent news.",
        "📖 Read the job description carefully and identify the key skills sought.",
        "💼 Prepare 2-3 concrete examples illustrating your experiences and achievements.",
        "👔 Dress professionally (attire, posture, language).",
        "⏰ Arrive 10-15 minutes early to avoid stress."
      ],
      options: [
        { text: "Back", icon: "↩️", action: "advice", style: "back" },
        { text: "Main Menu", icon: "🏠", action: "welcome", style: "back" }
      ]
    },
    
    questions: {
      title: ["❓ Common interview questions & how to answer them effectively:"],
      options: [
        { text: "Tell me about yourself", icon: "💬", action: "q1", style: "secondary" },
        { text: "Why this company?", icon: "🏢", action: "q2", style: "secondary" },
        { text: "Your strengths and weaknesses", icon: "⚖️", action: "q3", style: "secondary" },
        { text: "Your vision in 5 years", icon: "📈", action: "q4", style: "secondary" },
        { text: "Back", icon: "↩️", action: "advice", style: "back" },
        { text: "Main Menu", icon: "🏠", action: "welcome", style: "back" }
      ]
    },
    
    q1: {
      title: ["💬 Tell me about yourself"],
      tips: [
        "🧭 Structure your answer: education → experiences → relevant strengths.",
        "🗣️ Be concise and relevant (1-2 minutes).",
        "🎯 Tailor your presentation to the job you’re applying for."
      ],
      options: [
        { text: "Back to questions", icon: "↩️", action: "questions", style: "back" }
      ]
    },
    q2: {
      title: ["🏢 Why do you want to work with us?"],
      tips: [
        "🔍 Show that you know the company (projects, values, sector…).",
        "💬 Explain what attracts you: missions, culture, growth.",
        "🚀 Link it to your career objectives."
      ],
      options: [
        { text: "Back to questions", icon: "↩️", action: "questions", style: "back" }
      ]
    },
    q3: {
      title: ["⚖️ What are your strengths and weaknesses?"],
      tips: [
        "💪 Highlight 2-3 strengths relevant to the job.",
        "🧠 Choose a weakness that you are actively working to improve.",
        "💡 Be honest and professional."
      ],
      options: [
        { text: "Back to questions", icon: "↩️", action: "questions", style: "back" }
      ]
    },
    q4: {
      title: ["📈 Where do you see yourself in 5 years?"],
      tips: [
        "🎯 Speak about realistic career goals.",
        "🧩 Show that you want to grow within the company.",
        "🧘 Be flexible but ambitious."
      ],
      options: [
        { text: "Back to questions", icon: "↩️", action: "questions", style: "back" }
      ]
    }
  };

  getWelcomeData(): ChatResponse {
    return this.chatResponses['welcome'];
  }

  getResponseData(key: string): ChatResponse | undefined {
    return this.chatResponses[key];
  }
}
