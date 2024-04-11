import React from 'react';
import { I18nManager, Platform, Pressable } from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  Directions,
} from 'react-native-gesture-handler';

interface Props {
  width: number;
  height: number;
  onSingleTap: () => void;
  onDoubleTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onLongPress: () => void;
  children: React.ReactNode;
}

export function GestureHandler({
  width,
  height,
  onSingleTap,
  onDoubleTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  children,
}: Props) {
  const singleTap = Gesture.Tap().maxDuration(250).onStart(onSingleTap);

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(onDoubleTap);

  const longPress = Gesture.LongPress().onStart(onLongPress);

  const swipeLeft = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
    .onStart(onSwipeLeft);

  const swipeRight = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
    .onStart(onSwipeRight);

  const swipeUp = Gesture.Fling().direction(Directions.UP).onStart(onSwipeUp);

  const swipeDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onStart(onSwipeDown);

  return (
    <GestureHandlerRootView>
      <GestureDetector
        gesture={Gesture.Exclusive(
          swipeLeft,
          swipeRight,
          swipeUp,
          swipeDown,
          longPress,
          doubleTap,
          singleTap
        )}
      >
        <Pressable
          style={{ width, height }}
          onPress={() => Platform.OS === 'ios' && onSingleTap()}
          onLongPress={() => Platform.OS === 'ios' && onLongPress()}
        >
          {children}
        </Pressable>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
