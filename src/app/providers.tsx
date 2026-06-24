"use client";

import { Toast } from"@heroui/react";
import { MotionConfig } from"motion/react";

export function Providers({ children }: { children: React.ReactNode }) {
 return (
 <MotionConfig reducedMotion="user">
 {children}
 <Toast.Provider placement="bottom" />
 </MotionConfig>
 );
}
