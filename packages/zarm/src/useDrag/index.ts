import * as React from 'react';
import Events from '../utils/events';
import type { DragEvent, DragState, DragProps } from '../drag';

function isMouseEvent(e: DragEvent): e is MouseEvent {
  return e && !('touches' in e);
}

const useDrag = (props: DragProps) => {
  const { onDragStart, onDragMove, onDragEnd } = props;
  const [dragState, setDragState] = React.useState(Object.create(null));

  let currentX: number;
  let currentY: number;
  const isDragStart = dragState.startX !== undefined && dragState.startY !== undefined;

  const move = (event: DragEvent) => {
    if (!isDragStart) return false;

    if (isMouseEvent(event)) {
      currentX = event.clientX;
      currentY = event.clientY;
    } else {
      const touch = event.touches[0];
      currentX = touch.pageX;
      currentY = touch.pageY;
    }

    const offsetX = currentX! - dragState.startX!;
    const offsetY = currentY! - dragState.startY!;

    const state: DragState = {
      ...dragState,
      offsetX,
      offsetY,
    };

    if (typeof onDragMove === 'function' && !onDragMove(event, state)) {
      return;
    }

    setDragState(state);
  };

  const end = (event: DragEvent) => {
    if (!isDragStart) return false;

    if (isMouseEvent(event)) {
      Events.off(document.body, 'mousemove', move);
      Events.off(document.body, 'mouseup', end);
    }

    if (typeof onDragEnd === 'function') {
      onDragEnd(event, dragState);
    }

    setDragState(Object.create(null));
  };

  const start = (event: DragEvent) => {
    dragState.startTime = new Date();

    if (isMouseEvent(event)) {
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;

      Events.on(document.body, 'mousemove', move);
      Events.on(document.body, 'mouseup', end);
    } else {
      const touch = event.touches[0];
      dragState.startX = touch.pageX;
      dragState.startY = touch.pageY;
    }

    const state: DragState = {
      ...dragState,
    };

    setDragState(state);

    if (typeof onDragStart === 'function') {
      onDragStart(event, state);
    }
  };

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
  };
};

export default useDrag;
