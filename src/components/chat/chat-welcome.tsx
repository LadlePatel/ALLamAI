
"use client";

import React from 'react';
import { Icons } from '@/components/icons';
import { Sun, Zap, AlertOctagon, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { useTheme } from 'next-themes';
import type { SupportedLanguage } from '@/types'; // Added SupportedLanguage
import { SUPPORTED_LANGUAGES } from '@/config/languages'; // Added SUPPORTED_LANGUAGES

interface ChatWelcomeProps {
  selectedLanguage: SupportedLanguage;
}

const WelcomeCard = ({ title, text, icon: Icon, langDir }: { title?: string, text: string, icon?: React.ElementType, langDir: 'ltr' | 'rtl' }) => (
  <div className={`bg-card text-card-foreground p-3 rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors text-${langDir === 'rtl' ? 'right' : 'left'}`} dir={langDir}>
    {Icon && <Icon className={`w-4 h-4 mb-1.5 text-muted-foreground ${langDir === 'rtl' ? 'ml-auto' : 'mr-auto'}`} />}
    {title && <h3 className="font-semibold mb-0.5 text-card-foreground">{title}</h3>}
    <p className="text-card-foreground/80">{text}</p>
  </div>
);

export function ChatWelcome({ selectedLanguage }: ChatWelcomeProps) {
  const { theme } = useTheme();
  const langDir = selectedLanguage.dir;
  const isArabic = selectedLanguage.code === 'ar';

  // Dark Theme (Simplified)
  if (theme === 'dark') {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center p-4 md:p-8`} dir={langDir}>
        <div className="max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Icons.Logo className="h-12 w-12 text-primary" /> 
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center justify-center gap-2">
            <Sun className="w-6 h-6" /> {isArabic ? 'أمثلة' : 'Examples'}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <WelcomeCard text={isArabic ? '"اشرح الحوسبة الكمومية بعبارات بسيطة" ←' : '"Explain quantum computing in simple terms" →'} langDir={langDir} />
            <WelcomeCard text={isArabic ? '"هل لديك أفكار إبداعية لعيد ميلاد طفل عمره 10 سنوات؟" ←' : '"Got any creative ideas for a 10 year old\'s birthday?" →'} langDir={langDir} />
            <WelcomeCard text={isArabic ? '"كيف أقوم بإنشاء طلب HTTP في Javascript؟" ←' : '"How do I make an HTTP request in Javascript?" →'} langDir={langDir} />
          </div>
        </div>
      </div>
    );
  }

  // Light Theme or system default to light
  if (isArabic) {
    return (
      <div className="flex flex-col items-center justify-start h-full p-4 md:p-8 pt-12 md:pt-20 text-right" dir="rtl">
        <div className="max-w-2xl w-full text-center">
          <Icons.Logo className="h-10 w-10 mb-4 mx-auto text-primary" />
          <h1 className="text-3xl font-semibold mb-2 text-foreground">مرحباً بك في ALLamAI</h1>
          <p className="text-muted-foreground mb-10">اسأل ما تريد معرفته</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-end gap-2">
                <Zap className="w-5 h-5 order-last" /> القدرات
              </h2>
              <WelcomeCard text='"اشرح الحوسبة الكمومية بعبارات بسيطة" ←' langDir="rtl" />
              <WelcomeCard text="يسمح للمستخدم بتقديم تصحيحات متابعة" langDir="rtl" />
              <WelcomeCard text="مدرب على رفض الطلبات غير اللائقة" langDir="rtl" />
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-end gap-2">
                <AlertOctagon className="w-5 h-5 order-last" /> القيود
              </h2>
              <WelcomeCard text="معرفة محدودة بالعالم والأحداث بعد 2021" langDir="rtl" />
              <WelcomeCard text="قد يولد أحيانًا معلومات غير صحيحة" langDir="rtl" />
              <WelcomeCard text="قد ينتج أحيانًا تعليمات ضارة أو محتوى متحيز" langDir="rtl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Light Theme (English)
  return (
    <div className="flex flex-col items-center justify-start h-full p-4 md:p-8 pt-12 md:pt-20" dir="ltr">
      <div className="max-w-2xl w-full text-center">
        <Icons.Logo className="h-10 w-10 mb-4 mx-auto text-primary" />
        <h1 className="text-3xl font-semibold mb-2 text-foreground">Welcome to ALLamAI</h1>
        <p className="text-muted-foreground mb-10">Ask whatever you want to know</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-start gap-2">
              <Zap className="w-5 h-5" /> Capabilities
            </h2>
            <WelcomeCard text='"Explain quantum computing in simple terms" →' langDir="ltr" />
            <WelcomeCard text="Allows user to provide follow-up corrections" langDir="ltr" />
            <WelcomeCard text="Trained to decline inappropriate requests" langDir="ltr" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center justify-center md:justify-start gap-2">
              <AlertOctagon className="w-5 h-5" /> Limitations
            </h2>
            <WelcomeCard text="Limited knowledge of world and events after 2021" langDir="ltr" />
            <WelcomeCard text="May occasionally generate incorrect information" langDir="ltr" />
            <WelcomeCard text="May occasionally produce harmful instructions or biased content" langDir="ltr" />
          </div>
        </div>
      </div>
    </div>
  );
}
