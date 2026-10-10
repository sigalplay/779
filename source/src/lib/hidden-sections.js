// Site sections that are hidden for now: no menu entry and no links to them from other pages.
// The pages themselves still open from a direct address, so nothing that points at them breaks.
// To bring a section back, remove its address from this list.
export const HIDDEN_PATHS = ["/parent/board-games", "/therapist/board-games"];

export const isHiddenPath = (href) => HIDDEN_PATHS.some((hidden) => href === hidden || href.startsWith(`${hidden}/`) || href.startsWith(`${hidden}?`));
