import { Dimensions } from 'react-native';

export interface TooltipCoord {
  x: number;
  y: number;
}

function convertDimensionToNumber(
  dimension: number | string,
  screenDimension: number
): number {
  if (typeof dimension === 'string' && dimension.includes('%')) {
    const decimal = Number(dimension.replace(/%/, '')) / 100;
    return decimal * screenDimension;
  }

  if (typeof dimension === 'number') {
    return dimension;
  }

  return Number(dimension);
}

const getArea = (a: number, b: number): number => a * b;

const getPointDistance = (a: number[], b: number[]): number =>
  Math.sqrt(Math.pow(a[0]! - b[0]!, 2) + Math.pow(a[1]! - b[1]!, 2));

interface AreaEntry {
  area: number;
  id: number;
}

/**
 * Tooltip coordinate system:
 *
 * The tooltip coordinates are based on the element which it is wrapping.
 * We take the x and y coordinates of the element and find the best position
 * to place the tooltip. To find the best position we look for the side with the
 * most space. In order to find the side with the most space we divide the
 * surroundings in four quadrants and check for the one with biggest area.
 * Once we know the quadrant with the biggest area it places the tooltip in that
 * direction.
 *
 * To find the areas we first get 5 coordinate points. The center and the other
 * 4 extreme points which together make a perfect cross shape.
 *
 * Once we know the coordinates we can get the length of the vertices which form
 * each quadrant. Since they are squares we only need two.
 */
const getTooltipCoordinate = (
  x: number,
  y: number,
  width: number,
  height: number,
  screenWidth: number,
  screenHeight: number,
  receivedTooltipWidth: number | string,
  withPointer: boolean
): TooltipCoord => {
  const screenDims = Dimensions.get('window');

  const tooltipWidth = convertDimensionToNumber(
    receivedTooltipWidth,
    screenDims.width
  );

  // The following are point coordinates: [x, y]
  const center = [x + width / 2, y + height / 2];
  const pOne = [center[0]!, 0];
  const pTwo = [screenWidth, center[1]!];
  const pThree = [center[0]!, screenHeight];
  const pFour = [0, center[1]!];

  // vertices
  const vOne = getPointDistance(center, pOne);
  const vTwo = getPointDistance(center, pTwo);
  const vThree = getPointDistance(center, pThree);
  const vFour = getPointDistance(center, pFour);

  // Quadrant areas
  const areas: AreaEntry[] = [
    getArea(vOne, vFour),
    getArea(vOne, vTwo),
    getArea(vTwo, vThree),
    getArea(vThree, vFour),
  ].map((each, index) => ({ area: each, id: index }));

  const sortedArea = areas.sort((a, b) => b.area - a.area);

  // displaced points
  const dX = 0.001;
  const dY = height / 2;

  // Displace the coordinates in the direction of the quadrant
  const directionCorrection = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];

  const displaceReferencePoint = [
    [-tooltipWidth, 0],
    [0, 0],
    [0, 0],
    [-tooltipWidth, 0],
  ];

  // current quadrant index
  const qIndex = sortedArea[0]!.id;

  const getWithPointerOffsetY = (): number =>
    withPointer ? 10 * directionCorrection[qIndex]![1]! : 0;

  const getWithPointerOffsetX = (): number =>
    withPointer
      ? center[0]! - 18 * directionCorrection[qIndex]![0]!
      : center[0]!;

  const newX =
    getWithPointerOffsetX() +
    (dX * directionCorrection[qIndex]![0]! +
      displaceReferencePoint[qIndex]![0]!);

  return {
    x: constraintX(newX, qIndex, center[0]!, screenWidth, tooltipWidth),
    y:
      center[1]! +
      (dY * directionCorrection[qIndex]![1]! +
        displaceReferencePoint[qIndex]![1]!) +
      getWithPointerOffsetY(),
  };
};

const constraintX = (
  newX: number,
  qIndex: number,
  _x: number,
  screenWidth: number,
  tooltipWidth: number
): number => {
  switch (qIndex) {
    // 0 and 3 are the left side quadrants
    case 0:
    case 3: {
      const maxWidth = newX > screenWidth ? screenWidth - 10 : newX;
      return newX < 1 ? 10 : maxWidth;
    }
    // 1 and 2 are the right side quadrants
    case 1:
    case 2: {
      const leftOverSpace = screenWidth - newX;
      return leftOverSpace >= tooltipWidth
        ? newX
        : newX - (tooltipWidth - leftOverSpace + 10);
    }
    default: {
      return 0;
    }
  }
};

export default getTooltipCoordinate;
