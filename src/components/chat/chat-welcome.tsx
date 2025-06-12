
"use client";

import React from 'react';
import { Icons } from '@/components/icons';
import { Sun, Zap, AlertOctagon } from 'lucide-react';
import { useTheme } from 'next-themes';

const WelcomeCard = ({ title, text, icon: Icon }: { title?: string, text: string, icon?: React.ElementType }) => (
  <div className="bg-card text-card-foreground p-3 rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors">
    {Icon && <Icon className="w-4 h-4 mb-1.5 text-muted-foreground" />}
    {title && <h3 className="font-semibold mb-0.5 text-card-foreground">{title}</h3>}
    <p className="text-card-foreground/80">{text}</p>
  </div>
);

export function ChatWelcome() {
  const { theme } = useTheme();

  if (theme === 'dark') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Icons.Logo className="h-12 w-12 text-primary" /> 
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center justify-center gap-2">
            <Sun className="w-6 h-6" /> Examples
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <WelcomeCard text='"Explain quantum computing in simple terms" →' />
            <WelcomeCard text='"Got any creative ideas for a 10 year old\'s birthday?" →' />
            <WelcomeCard text='"How do I make an HTTP request in Javascript?" →' />
          </div>
        </div>
      </div>
    );
  }

  // Light Theme or system default to light
  return (
    <div className="flex flex-col items-center justify-start h-full p-4 md:p-8 pt-12 md:pt-20">
      <div className="max-w-2xl w-full text-center">
        <Icons.Logo className="h-10 w-10 mb-4 mx-auto text-primary" />
        <h1 className="text-3xl font-semibold mb-2 text-foreground">Welcome to ALLamAI</h1>
        <p className="text-muted-foreground mb-10">Ask whatever you want to know</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-start gap-2">
              <Zap className="w-5 h-5" /> Capabilities
            </h2>
            <WelcomeCard text='"Explain quantum computing in simple terms" →' />
            <WelcomeCard text="Allows user to provide follow-up corrections" />
            <WelcomeCard text="Trained to decline inappropriate requests" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-start gap-2">
              <AlertOctagon className="w-5 h-5" /> Limitations
            </h2>
            <WelcomeCard text="Limited knowledge of world and events after 2021" />
            <WelcomeCard text="May occasionally generate incorrect information" />
            <WelcomeCard text="May occasionally produce harmful instructions or biased content" />
          </div>
        </div>
      </div>
    </div>
  );
}

```