type ChatSession = {
  id: string;
  messages: { role: string; text: string }[];
  timestamp: number;
};

const globalStore = globalThis as typeof globalThis & {
  chatSessions?: Record<string, ChatSession>;
};

if (!globalStore.chatSessions) {
  globalStore.chatSessions = {};
}

export const getChatSessions = () => {
  if (!globalStore.chatSessions) return [];
  return Object.values(globalStore.chatSessions).sort((a, b) => b.timestamp - a.timestamp);
};

export const saveChat = (id: string, messages: { role: string; text: string }[]) => {
  if (!globalStore.chatSessions) {
    globalStore.chatSessions = {};
  }
  globalStore.chatSessions[id] = {
    id,
    messages,
    timestamp: Date.now()
  };
};
