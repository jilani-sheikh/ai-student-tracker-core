# Pulse Learn: Adaptive AI Tutor

Pulse Learn is a premium AI-powered tutoring platform that dynamically adjusts its teaching style based on user performance.

## Core Features

- **Adaptive AI Tutor**: Powered by Gemini 1.5 Flash. The tutor's tone and complexity shift based on your `pace_score`.
- **Bento Grid Dashboard**: High-end UI featuring real-time stats, progress tracking, and leaderboard.
- **Voice Integration**: Hands-free learning with Voice-to-Text (Speech Recognition) and Text-to-Speech (TTS).
- **Gamification**: Earn XP, level up, and unlock badges (Novice, Expert, Master) as you learn.
- **Cloud Persistence**: Full data sync using Appwrite Database.

## Adaptive Difficulty Logic

The platform calculates your "Pace Score" using the following mathematical model:

```javascript
NewPace = CurrentPace + Adjustment
```

### Adjustment Rules:
- **Quiz Score > 80%**: `+0.1` (Increases complexity)
- **Quiz Score < 50%**: `-0.1` (Decreases complexity)
- **Score 50% - 80%**: `0.0` (Maintains current level)

### AI Tone Mapping:
- **Steady (🌿 < 0.8)**: Uses 5-year-old analogies and basic concepts.
- **Balanced (📖 0.8 - 1.2)**: Standard educational tone with clear steps.
- **Rapid (⚡ > 1.2)**: Technical deep-dives and academic depth.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React, Sonner.
- **Backend**: Appwrite (TablesDB).
- **AI**: Google Gemini AI.
