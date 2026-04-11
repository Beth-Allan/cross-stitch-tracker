import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for jsdom (required by cmdk/Popover)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill scrollIntoView for jsdom (required by cmdk)
Element.prototype.scrollIntoView = function () {};
