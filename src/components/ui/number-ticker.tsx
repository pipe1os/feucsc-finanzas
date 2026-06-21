"use client";

import {
  useEffect,
  useRef,
  useState,
  useReducer,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/lib/utils";

let hasAnimatedThisSession = false;

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  formatFn?: (value: number) => string;
  animate?: boolean;
}

function useInViewOnce(ref: React.RefObject<Element | null>, margin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, inView]);
  return inView;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  formatFn,
  animate = true,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInViewOnce(ref);

  const skipAnimation = hasAnimatedThisSession || !animate;

  const targetValue = direction === "down" ? startValue : value;
  const [displayValue, setDisplayValue] = useReducer((_: number, val: number) => val, targetValue);

  useEffect(() => {
    if (!isInView) return;
    if (skipAnimation) {
      const timer = setTimeout(() => {
        setDisplayValue(direction === "down" ? startValue : value);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      hasAnimatedThisSession = true;
      const start = direction === "down" ? value : startValue;
      const end = direction === "down" ? startValue : value;

      setDisplayValue(start);

      const duration = 1200;
      const startTime = performance.now();

      let rafId: number;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - (1 - progress) * (1 - progress);
        const current = start + (end - start) * eased;
        setDisplayValue(current);
        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };
      rafId = requestAnimationFrame(tick);

      return () => cancelAnimationFrame(rafId);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, delay, value, direction, startValue, skipAnimation]);

  const formattedDisplay = formatFn
    ? formatFn(Number(displayValue.toFixed(decimalPlaces)))
    : Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(displayValue.toFixed(decimalPlaces)));

  const formattedTarget = formatFn
    ? formatFn(Number(targetValue.toFixed(decimalPlaces)))
    : Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(targetValue.toFixed(decimalPlaces)));

  return (
    <span
      ref={ref}
      className={cn("inline-grid tabular-nums", className)}
      suppressHydrationWarning
      {...props}
    >
      <span className="invisible col-start-1 row-start-1">
        {formattedTarget}
      </span>
      <span className="col-start-1 row-start-1">
        {formattedDisplay}
      </span>
    </span>
  );
}
