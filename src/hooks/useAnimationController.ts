import { useState, useCallback, useRef, useEffect } from 'react';
import type { GifInfo, AnimationState } from '../lib/gif-types';

interface UseAnimationControllerProps {
  gifInfo: GifInfo | null;
  onFrameChange?: (frameIndex: number) => void;
}

export interface UseAnimationControllerReturn extends AnimationState {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
  goToFrame: (frameIndex: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToStart: () => void;
  goToEnd: () => void;
  jumpFrames: (delta: number) => void;
}

export function useAnimationController({
  gifInfo,
  onFrameChange,
}: UseAnimationControllerProps): UseAnimationControllerReturn {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentFrame: 0,
    speed: 1,
    loop: true,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GIF情報が変わったときにリセット
  useEffect(() => {
    if (!gifInfo) {
      setAnimationState(prev => ({
        ...prev,
        currentFrame: 0,
        isPlaying: false,
      }));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [gifInfo]);

  // フレーム変更時のコールバック
  useEffect(() => {
    onFrameChange?.(animationState.currentFrame);
  }, [animationState.currentFrame, onFrameChange]);

  const scheduleNextFrame = useCallback(() => {
    if (!gifInfo || animationState.currentFrame >= gifInfo.frames.length) return;

    const currentFrameData = gifInfo.frames[animationState.currentFrame];
    const delay = Math.max(currentFrameData.delay * 10, 10); // 最小10ms
    const adjustedDelay = delay / animationState.speed;

    timeoutRef.current = setTimeout(() => {
      setAnimationState(prev => {
        const nextFrame = prev.currentFrame + 1;
        
        if (nextFrame >= gifInfo.frames.length) {
          if (prev.loop) {
            return { ...prev, currentFrame: 0 };
          } else {
            // ループしない場合は停止
            return { ...prev, isPlaying: false };
          }
        }
        
        return { ...prev, currentFrame: nextFrame };
      });
    }, adjustedDelay);
  }, [gifInfo, animationState.currentFrame, animationState.speed, animationState.loop]);

  // 再生状態が変わったときのスケジューリング
  useEffect(() => {
    if (animationState.isPlaying && gifInfo) {
      scheduleNextFrame();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [animationState.isPlaying, animationState.currentFrame, scheduleNextFrame]);

  const play = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setAnimationState(prev => ({ ...prev, speed: Math.max(0.1, Math.min(10, speed)) }));
  }, []);

  const setLoop = useCallback((loop: boolean) => {
    setAnimationState(prev => ({ ...prev, loop }));
  }, []);

  const goToFrame = useCallback((frameIndex: number) => {
    if (!gifInfo) return;
    
    const clampedIndex = Math.max(0, Math.min(frameIndex, gifInfo.frames.length - 1));
    setAnimationState(prev => ({ ...prev, currentFrame: clampedIndex }));
  }, [gifInfo]);

  const nextFrame = useCallback(() => {
    if (!gifInfo) return;
    
    setAnimationState(prev => {
      const nextIndex = prev.currentFrame + 1;
      if (nextIndex >= gifInfo.frames.length) {
        return prev.loop ? { ...prev, currentFrame: 0 } : prev;
      }
      return { ...prev, currentFrame: nextIndex };
    });
  }, [gifInfo]);

  const prevFrame = useCallback(() => {
    if (!gifInfo) return;
    
    setAnimationState(prev => {
      const prevIndex = prev.currentFrame - 1;
      if (prevIndex < 0) {
        return prev.loop ? { ...prev, currentFrame: gifInfo.frames.length - 1 } : prev;
      }
      return { ...prev, currentFrame: prevIndex };
    });
  }, [gifInfo]);

  const goToStart = useCallback(() => {
    goToFrame(0);
  }, [goToFrame]);

  const goToEnd = useCallback(() => {
    if (!gifInfo) return;
    goToFrame(gifInfo.frames.length - 1);
  }, [goToFrame, gifInfo]);

  const jumpFrames = useCallback((delta: number) => {
    if (!gifInfo) return;
    
    setAnimationState(prev => {
      let newFrame = prev.currentFrame + delta;
      
      if (newFrame < 0) {
        newFrame = prev.loop ? gifInfo.frames.length + (newFrame % gifInfo.frames.length) : 0;
      } else if (newFrame >= gifInfo.frames.length) {
        newFrame = prev.loop ? newFrame % gifInfo.frames.length : gifInfo.frames.length - 1;
      }
      
      return { ...prev, currentFrame: newFrame };
    });
  }, [gifInfo]);

  return {
    ...animationState,
    play,
    pause,
    toggle,
    setSpeed,
    setLoop,
    goToFrame,
    nextFrame,
    prevFrame,
    goToStart,
    goToEnd,
    jumpFrames,
  };
}
