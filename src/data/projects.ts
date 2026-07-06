export interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  aiContext: string;
  demoUrl?: string;
  slug: string;
  longDescription?: string;
  technologies?: string[];
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Vidscene",
    description: "Detect scenes and moments in videos automatically",
    longDescription:
      "Vidscene uses advanced AI computer vision to automatically detect scene changes, key moments, and transitions in videos. I created this to help me split old family videos into scenes.",
    icon: "🎬",
    aiContext: "AI-powered processing",
    demoUrl: "https://vidscene.example.com",
    slug: "vidscene",
    technologies: ["Computer Vision", "PyTorch", "FFmpeg", "React"],
  },
  {
    id: "2",
    title: "PhysioFit",
    description: "AI-powered personalized workout plan generator",
    longDescription:
      "PhysioFit generates customized workout plans based on your fitness level, goals, injuries or limitations and available equipment. The AI adapts the plan based on your progress and feedback to keep you motivated and on track.",
    icon: "💪",
    aiContext: "AI-built tool",
    demoUrl: "https://physiofit.example.com",
    slug: "physiofit",
    technologies: ["Machine Learning", "Health APIs", "Next.js", "PostgreSQL"],
  },
  {
    id: "3",
    title: "Likes + Dislikes",
    description: "Couple compatibility analyzer",
    longDescription:
      "An interactive app that helps couples understand their intimacy compatibility through a detailed questionnaire. The application provides insights based on the couple's responses.",
    icon: "💑",
    aiContext: "AI-powered conversations",
    demoUrl: "https://likesdislikes.example.com",
    slug: "likes-dislikes",
    technologies: ["NLP", "Claude API", "React", "WebSockets"],
  },
];
