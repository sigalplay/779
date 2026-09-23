const GUEST_BOARDS_KEY = "boo_guest_boards_by_date";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DRAWING_PREFIX = "boo_board_drawing_guest";

export function localTodayIso() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function normalizeBoardDate(value) {
  return DATE_PATTERN.test(value || "") ? value : localTodayIso();
}

export function addBoardDays(value, days) {
  const date = new Date(`${normalizeBoardDate(value)}T12:00:00`);
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function readBoards() {
  try {
    const value = JSON.parse(localStorage.getItem(GUEST_BOARDS_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function parseItems(value) {
  try {
    const items = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function getGuestBoard(date) {
  const boards = readBoards();
  return Object.prototype.hasOwnProperty.call(boards, date) ? parseItems(boards[date]) : null;
}

export function saveGuestBoard(date, items) {
  const safeDate = normalizeBoardDate(date);
  const boards = readBoards();
  boards[safeDate] = JSON.stringify(Array.isArray(items) ? items : []);
  localStorage.setItem(GUEST_BOARDS_KEY, JSON.stringify(boards));
}

export function guestBoardDates(activeDate) {
  return [...new Set([...Object.keys(readBoards()).filter((date) => DATE_PATTERN.test(date)), normalizeBoardDate(activeDate)])].sort();
}

export function getGuestBoardDrawing(date) {
  try {
    const value = JSON.parse(localStorage.getItem(`${DRAWING_PREFIX}_${normalizeBoardDate(date)}`) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function saveGuestBoardDrawing(date, drawingData) {
  localStorage.setItem(`${DRAWING_PREFIX}_${normalizeBoardDate(date)}`, JSON.stringify(Array.isArray(drawingData) ? drawingData : []));
}
