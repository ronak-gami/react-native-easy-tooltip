import { Tooltip, Triangle, getTooltipCoordinate } from '../index';
import type { TooltipProps, TriangleProps, ActionType } from '../index';

describe('Tooltip', () => {
  it('should be a valid component', () => {
    expect(Tooltip).toBeDefined();
    expect(typeof Tooltip).toBe('function');
  });
});

describe('Triangle', () => {
  it('should be a valid component', () => {
    expect(Triangle).toBeDefined();
    expect(typeof Triangle).toBe('function');
  });
});

describe('getTooltipCoordinate', () => {
  it('should be a valid function', () => {
    expect(getTooltipCoordinate).toBeDefined();
    expect(typeof getTooltipCoordinate).toBe('function');
  });
});

describe('Types', () => {
  it('should export TooltipProps type', () => {
    const props: Partial<TooltipProps> = {
      withPointer: true,
      actionType: 'press',
    };
    expect(props.withPointer).toBe(true);
  });

  it('should export TriangleProps type', () => {
    const props: TriangleProps = {
      isDown: false,
    };
    expect(props.isDown).toBe(false);
  });

  it('should export ActionType type', () => {
    const action: ActionType = 'press';
    expect(action).toBe('press');
  });
});
