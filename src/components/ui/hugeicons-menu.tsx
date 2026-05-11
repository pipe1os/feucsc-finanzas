'use client';

import type { Variants } from 'motion/react';
import type { HTMLAttributes, Ref } from 'react';
import { useCallback, useImperativeHandle, useRef } from 'react';
import { LazyMotion, m, useAnimation, domAnimation } from 'motion/react';

import { cn } from '@/lib/utils';

export interface HugeiconsMenuIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface HugeiconsMenuIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  ref?: Ref<HugeiconsMenuIconHandle>;
}

const LINE_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    y: 0,
    opacity: 1,
  },
  animate: (custom: number) => ({
    rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
    y: custom === 1 ? 7 : custom === 3 ? -7 : 0,
    opacity: custom === 2 ? 0 : 1,
    transition: {
      type: 'tween',
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

function HugeiconsMenuIcon({ onMouseEnter, onMouseLeave, className, size = 28, ref, ...props }: HugeiconsMenuIconProps) {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlledRef.current) {
        controls.start('animate');
      } else {
        onMouseEnter?.(e);
      }
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlledRef.current) {
        controls.start('normal');
      } else {
        onMouseLeave?.(e);
      }
    },
    [controls, onMouseLeave]
  );

  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <LazyMotion features={domAnimation}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <m.path
            d="M4 5L20 5"
            variants={LINE_VARIANTS}
            animate={controls}
            custom={1}
            style={{ transformOrigin: '12px 5px' }}
          />
          <m.path
            d="M4 12L20 12"
            variants={LINE_VARIANTS}
            animate={controls}
            custom={2}
            style={{ transformOrigin: '12px 12px' }}
          />
          <m.path
            d="M4 19L20 19"
            variants={LINE_VARIANTS}
            animate={controls}
            custom={3}
            style={{ transformOrigin: '12px 19px' }}
          />
        </svg>
      </LazyMotion>
    </div>
  );
}

export { HugeiconsMenuIcon };
