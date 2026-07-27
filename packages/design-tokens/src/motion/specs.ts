export const motionSpecs = {
  toast: {
    enter: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  dialog: {
    enter: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  drawer: {
    enter: { duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  tabSwitch: {
    duration: 150,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  tableRow: {
    enter: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    hover: { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  commandPalette: {
    enter: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  dropdown: {
    enter: { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 75, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  tooltip: {
    enter: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 200 },
    exit: { duration: 100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  bulkActionBar: {
    enter: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  notificationBadge: {
    enter: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    pulse: { duration: 1000, easing: 'ease-in-out', iterations: Infinity },
  },
  pageTransition: {
    enter: { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    exit: { duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  chart: {
    enter: { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    update: { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
  kpiCard: {
    enter: { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    valueChange: { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  },
} as const;

export type MotionSpecs = typeof motionSpecs;