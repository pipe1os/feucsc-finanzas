"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

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
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 170,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [motionValue, isInView, delay, value, direction, startValue]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
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
    [springValue, decimalPlaces, formatFn],
  );

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums",
        className,
      )}
      {...props}
    >
      {formatFn ? formatFn(startValue) : startValue}
    </span>
  );
}
