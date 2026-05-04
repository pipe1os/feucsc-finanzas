"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { animate, useInView, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

// Global session flag: once any NumberTicker has animated, never re-animate
// on client-side navigation (e.g. /faq -> /).
let hasAnimatedThisSession = false;

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  formatFn?: (value: number) => string;
}

/**
 * Animated number ticker — counts up/down to a target value using spring physics.
 * Uses `motion/react` for zero-React-render DOM updates.
 * Animates only when scrolled into view (once).
 */
export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  formatFn,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // If we've already animated this session, jump straight to the final value
  // so there is no flash of the start value on re-mount.
  const skipAnimation = hasAnimatedThisSession;
  const initialValue = skipAnimation
    ? direction === "down"
      ? startValue
      : value
    : direction === "down"
      ? value
      : startValue;

  const motionValue = useMotionValue(initialValue);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let animation: ReturnType<typeof animate> | null = null;

    if (isInView) {
      if (skipAnimation) {
        // Already animated this session — snap to final value instantly
        motionValue.set(direction === "down" ? startValue : value);
        return;
      }

      timer = setTimeout(() => {
        hasAnimatedThisSession = true;
        animation = animate(
          motionValue,
          direction === "down" ? startValue : value,
          { duration: 1.2, ease: "easeOut" },
        );
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      if (animation !== null) {
        animation.stop();
      }
    };
  }, [motionValue, isInView, delay, value, direction, startValue, skipAnimation]);

  useEffect(
    () =>
      motionValue.on("change", (latest) => {
        if (ref.current) {
          const formatted = formatFn
            ? formatFn(Number(latest.toFixed(decimalPlaces)))
            : Intl.NumberFormat("en-US", {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces,
              }).format(Number(latest.toFixed(decimalPlaces)));

          ref.current.textContent = formatted;
        }
      }),
    [motionValue, decimalPlaces, formatFn],
  );

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums", className)}
      {...props}
    >
      {formatFn ? formatFn(initialValue) : initialValue}
    </span>
  );
}
