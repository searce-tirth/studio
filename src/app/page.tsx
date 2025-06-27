import ChatPanel from '@/components/chat-panel';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full flex flex-col">
        <ChatPanel />
      </div>
    </main>
  );
}
