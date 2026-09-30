// Shapes with a pattern (sun rays, star points, gear teeth) are
// calculated with Math.cos / Math.sin instead of typed coordinates.

function buildSunIconPath() {
  const rayCount = 8;
  const innerRadius = 7;
  const outerRadius = 10;
  let pathData = 'M16 12a4 4 0 1 1-8 0a4 4 0 1 1 8 0';
  for (let rayNumber = 0; rayNumber < rayCount; rayNumber++) {
    const angle = rayNumber * (2 * Math.PI / rayCount);
    const startX = 12 + Math.cos(angle) * innerRadius;
    const startY = 12 + Math.sin(angle) * innerRadius;
    const endX = 12 + Math.cos(angle) * outerRadius;
    const endY = 12 + Math.sin(angle) * outerRadius;
    pathData += ' M' + startX.toFixed(2) + ' ' + startY.toFixed(2) + ' L' + endX.toFixed(2) + ' ' + endY.toFixed(2);
  }
  return pathData;
}

function buildStarIconPath() {
  // 8 points that alternate between a long and a short radius = a 4-pointed star.
  const pointCount = 8;
  let pathData = '';
  for (let pointNumber = 0; pointNumber < pointCount; pointNumber++) {
    const angle = pointNumber * (2 * Math.PI / pointCount) - Math.PI / 2;
    const radius = pointNumber % 2 === 0 ? 9 : 2.6;
    const pointX = 12 + Math.cos(angle) * radius;
    const pointY = 12 + Math.sin(angle) * radius;
    pathData += (pointNumber === 0 ? 'M' : 'L') + pointX.toFixed(2) + ' ' + pointY.toFixed(2) + ' ';
  }
  return pathData + 'Z';
}

function buildGearIconPath() {
  // 8 teeth: each tooth uses 4 points (2 on the outer radius, 2 on the inner radius).
  const toothCount = 8;
  const pointsPerTooth = 4;
  const totalPoints = toothCount * pointsPerTooth;
  const outerRadius = 9.5;
  const innerRadius = 7.2;
  let pathData = '';
  for (let pointNumber = 0; pointNumber < totalPoints; pointNumber++) {
    const angle = pointNumber * (2 * Math.PI / totalPoints);
    const isOuterPoint = pointNumber % pointsPerTooth < 2;
    const radius = isOuterPoint ? outerRadius : innerRadius;
    const pointX = 12 + Math.cos(angle) * radius;
    const pointY = 12 + Math.sin(angle) * radius;
    pathData += (pointNumber === 0 ? 'M' : 'L') + pointX.toFixed(2) + ' ' + pointY.toFixed(2) + ' ';
  }
  return pathData + 'Z M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0';
}

export const ICON_PATHS = {
  plane: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  house: 'M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6',
  heart: 'M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.5-9 9-9 9z',
  car: 'M3 13l2-5h14l2 5v4H3z M3 13h18 M7 17v2 M17 17v2',
  study: 'M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5',
  sun: buildSunIconPath(),
  star: buildStarIconPath(),
  gear: buildGearIconPath(),
  home: 'M3 11l9-7 9 7v9h-6v-6H9v6H3z',
  wallet: 'M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7l12-4v4 M16 14h2',
  stats: 'M4 20V11 M10 20V5 M16 20v-6 M21 20H3',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  chevronDown: 'M6 9l6 6 6-6',
  back: 'M15 18l-6-6 6-6',
  forward: 'M9 6l6 6-6 6',
  arrowUpRight: 'M7 17L17 7 M8 7h9v9',
  pencil: 'M4 20l4-1 11-11-3-3L5 16z M14 6l3 3',
  plus: 'M12 5v14 M5 12h14',
  check: 'M5 12l5 5 9-10',
  close: 'M6 6l12 12 M18 6L6 18',
  pause: 'M8 5v14 M16 5v14',
  play: 'M7 5l12 7-12 7z',
  share: 'M12 3v12 M7 8l5-5 5 5 M5 14v6h14v-6',
  coins: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  trend: 'M4 18l5-5 4 4 7-8 M15 9h5v5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  people: 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7 M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5 M16 4.5a3.3 3.3 0 0 1 0 6.3 M18 14.8c1.9.7 3.1 2.4 3.5 5.2',
};

export type IconName = keyof typeof ICON_PATHS;
