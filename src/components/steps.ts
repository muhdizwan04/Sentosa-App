import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

// Step-by-step screens. Tap moves on; with `?auto=1` the screen plays itself (for recordings and walk-up demos).
// delays[i] = ms to wait on step i before moving to step i+1.
export function useSteps(count: number, delays: number[], onEnd?: () => void) {
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, count - 1));
  useEffect(() => {
    if (!auto) return;
    if (step >= count - 1) {
      if (onEnd && delays[step] !== undefined) {
        const id = setTimeout(onEnd, delays[step]);
        return () => clearTimeout(id);
      }
      return;
    }
    const id = setTimeout(next, delays[step] ?? 2000);
    return () => clearTimeout(id);
  }, [auto, step]); // eslint-disable-line react-hooks/exhaustive-deps
  return { step, next, setStep, auto: !!auto };
}
