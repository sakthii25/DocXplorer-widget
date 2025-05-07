import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader, Bot } from "lucide-react";

const TestBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
  
    setMessages(prevMessages => [...prevMessages, {role: 'user', content: inputMessage}, {role: 'bot', content: 'Thinking...', isloding: true}]);
  
    const payload = {
      query: inputMessage,
      user_email: "sakthinarayananr25@gmail.com"
    };
    setInputMessage('');
  
    // Start fetching
    fetch("http://0.0.0.0:8000/query-docs", {
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
  
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages];
        const index = updatedMessages.length - 1;
        updatedMessages[index] = {
          ...updatedMessages[index],
          content: '',
          isloding: false
        };
        return updatedMessages;
      })
  
      const read = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
  
          // Append the incoming chunk to the bot's last message
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            const index = updatedMessages.length - 1;
            updatedMessages[index] = {
              ...updatedMessages[index],
              content: updatedMessages[index].content + chunk
            };
            return updatedMessages;
          });
        }
      };
  
      read();
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* <h1 className="text-3xl font-bold mb-8">Test Bot</h1> */}
      <div className="fixed bottom-4 right-4 z-50">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              DocXAi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsWidgetOpen(true)}>Open Chat</Button>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isWidgetOpen} onOpenChange={setIsWidgetOpen}>
      <DialogContent className="w-[90vw] max-w-md"> 
        <DialogHeader>
          <DialogTitle>Ask DocXAi</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[600px] overflow-hidden"> {/* ✅ fix 3 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mb-4 space-y-4 p-4 rounded-lg bg-muted">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`break-words whitespace-pre-wrap overflow-hidden max-w-full rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`} // ✅ fix 1
                >
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold my-2" {...props} />,
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                          <div className="overflow-auto max-w-full">
                            <SyntaxHighlighter
                              wrapLongLines={true}
                              style={oneDark}
                              language={match ? match[1] : 'text'}
                              PreTag="div"
                              customStyle={{
                                maxWidth: '100%', // ✅ fix 2
                                overflowX: 'auto',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className="bg-muted px-1 py-0.5 rounded text-[0.85em]" {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ node, ...props }) => <p className="leading-7 my-2" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                      li: ({ node, ...props }) => <li className="ml-4 list-disc" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.isloding && (<Loader className="h-4 w-4 animate-spin" />)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestBot;
