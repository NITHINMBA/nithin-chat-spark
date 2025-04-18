
import React, { useState, useEffect, useRef } from "react";
import { Send, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  typing?: boolean;
};

const WEBHOOK_URL = "https://nithinm1609.app.n8n.cloud/webhook-test/nithin";

const Chat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const html = window.document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const tempBotMessageId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: tempBotMessageId, text: "", sender: "bot", typing: true },
      ]);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!response.ok) {
        throw new Error(`Network response not ok, ${response.status}`);
      }

      const data = await response.json();

      // Handle webhook response array with objects containing 'output'
      let botReply = "Sorry, I could not get a response.";

      if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
        if ("output" in data[0] && typeof data[0].output === "string") {
          botReply = data[0].output;
        }
      } else if (typeof data === "object" && data !== null) {
        if ("reply" in data && typeof data.reply === "string") {
          botReply = data.reply;
        } else if ("message" in data && typeof data.message === "string") {
          botReply = data.message;
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? { id: tempBotMessageId, text: botReply, sender: "bot" }
            : msg
        )
      );
    } catch (error) {
      toast({
        title: "Webhook request failed",
        description:
          "Failed to get bot response from N8N webhook. Please check your webhook and try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => !m.typing));
    } finally {
      setIsTyping(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        handleSend();
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-white dark:bg-[#343541] rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-100 dark:bg-[#202123] border-b border-gray-300 dark:border-[#444654]">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 select-none">
          Nithin's ChatGPT Test
        </h2>
        <button
          aria-label="Toggle Dark Mode"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-md hover:bg-gray-300 dark:hover:bg-[#525357] transition-colors"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      <div
        className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-[#282b33]"
        style={{ scrollbarGutter: "stable" }}
      >
        {messages.length === 0 && !isTyping && (
          <p className="text-center text-gray-500 dark:text-gray-400 select-none mt-24">
            Say hi to start the conversation!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`
              max-w-[80%] mb-4 p-4 rounded-lg break-words whitespace-pre-wrap
              ${
                msg.sender === "user"
                  ? "ml-auto bg-[#0084ff] text-white rounded-br-none dark:bg-[#0050aa]"
                  : "mr-auto bg-gray-200 text-gray-900 rounded-bl-none dark:bg-[#444654] dark:text-gray-100"
              }
              flex items-center
            `}
            aria-live={msg.sender === "bot" ? "polite" : undefined}
            role={msg.typing ? "status" : undefined}
          >
            {msg.typing ? <TypingAnimation /> : msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isTyping) {
            handleSend();
          }
        }}
        className="flex items-center gap-3 border-t border-gray-300 dark:border-[#444654] bg-gray-50 dark:bg-[#40414f] p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 rounded-md p-2"
          disabled={isTyping}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          aria-label="Send message"
          className="p-2 rounded-md bg-[#0084ff] hover:bg-[#0069c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const TypingAnimation = () => (
  <div className="flex items-center space-x-1">
    <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce dark:bg-gray-300" />
    <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce animation-delay-200 dark:bg-gray-300" />
    <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce animation-delay-400 dark:bg-gray-300" />
  </div>
);

export default Chat;

