const BASE = "/icon-bank/weekly-board";

export const WEEKLY_BOARD_CATEGORIES = [
  {
    id: "work",
    label: "עבודה",
    color: "#F8EDB8",
    tasks: [
      { id: "work-at-desk", title: "עבודה", image: `${BASE}/work-at-desk.webp` },
      { id: "work-from-home", title: "עבודה מהבית", image: `${BASE}/work-from-home.webp` },
      { id: "work-meeting", title: "פגישה", image: `${BASE}/work-meeting.webp` },
    ],
  },
  {
    id: "studies",
    label: "לימודים",
    color: "#DCEEF8",
    tasks: [
      { id: "school", title: "בית ספר", image: `${BASE}/school.webp` },
      { id: "homework", title: "הכנת שיעורים", image: `${BASE}/homework.webp` },
      { id: "exam-study", title: "למידה למבחן", image: `${BASE}/exam-study.webp` },
      { id: "reading", title: "קריאה", image: `${BASE}/reading.webp` },
      { id: "private-lesson", title: "שיעור פרטי", image: `${BASE}/private-lesson.webp` },
    ],
  },
  {
    id: "leisure",
    label: "פנאי",
    color: "#F8DFE8",
    tasks: [
      { id: "game", title: "משחק", image: `${BASE}/game.webp` },
      { id: "outing", title: "טיול", image: `${BASE}/outing.webp` },
      { id: "friends", title: "מפגש עם חברים", image: `${BASE}/friends.webp` },
      { id: "screen-time", title: "זמן מסך", image: `${BASE}/screen-time.webp` },
      { id: "creative", title: "יצירה", image: `${BASE}/creative.webp` },
      { id: "garden", title: "גינה", image: `${BASE}/garden-playground-v2.webp` },
    ],
  },
  {
    id: "clubs",
    label: "חוגים",
    color: "#DDEEDC",
    tasks: [
      { id: "swimming", title: "שחייה", image: `${BASE}/swimming.webp` },
      { id: "football", title: "כדורגל", image: `${BASE}/football.webp` },
      { id: "dance", title: "ריקוד", image: `${BASE}/dance.webp` },
      { id: "music", title: "מוזיקה", image: `${BASE}/music.webp` },
      { id: "exercise", title: "התעמלות", image: `${BASE}/exercise.webp` },
      { id: "therapy", title: "טיפול", image: `${BASE}/therapy.webp` },
    ],
  },
  {
    id: "home",
    label: "משימות בית",
    color: "#F9E2C8",
    tasks: [
      { id: "laundry", title: "כביסה", image: `${BASE}/laundry.webp` },
      { id: "shopping", title: "קניות", image: `${BASE}/shopping.webp` },
      { id: "cooking", title: "בישול", image: `${BASE}/cooking.webp` },
      { id: "tidy-room", title: "סידור החדר", image: `${BASE}/tidy-room.webp` },
      { id: "cleaning", title: "ניקיון", image: `${BASE}/cleaning.webp` },
      { id: "walk-dog", title: "הוצאת כלב", image: `${BASE}/walk-dog.webp` },
    ],
  },
  {
    id: "other",
    label: "שונות",
    color: "#E8E0F4",
    tasks: [
      { id: "doctor", title: "רופא", image: `${BASE}/doctor.webp` },
      { id: "birthday", title: "יום הולדת", image: `${BASE}/birthday.webp` },
      { id: "errands", title: "סידורים", image: `${BASE}/errands.webp` },
      { id: "travel", title: "נסיעה", image: `${BASE}/travel.webp` },
      { id: "family-event", title: "אירוע משפחתי", image: `${BASE}/family-event.webp` },
      { id: "reminder", title: "תזכורת", image: `${BASE}/reminder.webp` },
    ],
  },
];

const KIDS_BASE = "/icon-bank/weekly-board-kids";
const kidsTask = (id, title) => ({ id: `kids-${id}`, title, image: `${KIDS_BASE}/${id}.webp` });

export const KIDS_WEEKLY_BOARD_CATEGORIES = [
  { id: "kids-morning", label: "בוקר", color: "#F8EDB8", tasks: [kidsTask("wake-up", "קמים בבוקר"), kidsTask("get-dressed", "מתלבשים"), kidsTask("brush-teeth", "מצחצחים שיניים"), kidsTask("breakfast", "ארוחת בוקר"), kidsTask("pack-bag", "מכינים תיק"), kidsTask("leave-home", "יוצאים מהבית")] },
  { id: "kids-learning", label: "גן ולימודים", color: "#DCEEF8", tasks: [kidsTask("kindergarten", "גן"), kidsTask("school", "בית ספר"), kidsTask("reading", "קריאה"), kidsTask("homework", "שיעורי בית"), kidsTask("therapy", "טיפול"), kidsTask("return-home", "חוזרים הביתה")] },
  { id: "kids-afternoon", label: "אחר הצהריים", color: "#F8DFE8", tasks: [kidsTask("lunch", "ארוחת צהריים"), kidsTask("rest", "מנוחה"), kidsTask("blocks", "משחק"), kidsTask("craft", "יצירה"), kidsTask("friends", "חברים"), kidsTask("playground", "גינה")] },
  { id: "kids-clubs", label: "חוגים ותנועה", color: "#DDEEDC", tasks: [kidsTask("swimming", "שחייה"), kidsTask("football", "כדורגל"), kidsTask("dance", "ריקוד"), kidsTask("music", "מוזיקה"), kidsTask("gymnastics", "התעמלות"), kidsTask("bicycle", "רכיבה על אופניים")] },
  { id: "kids-home", label: "בבית", color: "#F9E2C8", tasks: [kidsTask("tidy-toys", "מסדרים צעצועים"), kidsTask("help-cooking", "עוזרים במטבח"), kidsTask("shopping", "קניות"), kidsTask("walk-dog", "טיול עם הכלב"), kidsTask("bath", "מקלחת"), kidsTask("pajamas", "לובשים פיג׳מה")] },
  { id: "kids-evening", label: "ערב ושונות", color: "#E8E0F4", tasks: [kidsTask("bedtime-story", "סיפור לפני השינה"), kidsTask("sleep", "שינה"), kidsTask("doctor", "רופא"), kidsTask("birthday", "יום הולדת"), kidsTask("car-ride", "נסיעה"), kidsTask("screen-time", "זמן מסך")] },
];

export const WEEKLY_BOARD_TASKS = [...WEEKLY_BOARD_CATEGORIES, ...KIDS_WEEKLY_BOARD_CATEGORIES].flatMap((category) =>
  category.tasks.map((task) => ({
    ...task,
    categoryId: category.id,
    categoryLabel: category.label,
    categoryColor: category.color,
  })),
);

export function weeklyBoardTaskById(taskId) {
  return WEEKLY_BOARD_TASKS.find((task) => task.id === taskId) ?? null;
}

const CATEGORY_LABELS_EN = {
  work: "Work", studies: "Studies", leisure: "Leisure", clubs: "Clubs & activities", home: "Household tasks", other: "Other",
  "kids-morning": "Morning", "kids-learning": "Preschool & learning", "kids-afternoon": "Afternoon",
  "kids-clubs": "Clubs & movement", "kids-home": "At home", "kids-evening": "Evening & other",
};

const TASK_TITLES_EN = {
  "work-at-desk": "Work", "work-from-home": "Work from home", "work-meeting": "Meeting",
  school: "School", homework: "Homework", "exam-study": "Study for a test", reading: "Reading", "private-lesson": "Private lesson",
  game: "Game", outing: "Outing", friends: "Meet friends", "screen-time": "Screen time", creative: "Arts & crafts", garden: "Playground",
  swimming: "Swimming", football: "Football", dance: "Dance", music: "Music", exercise: "Exercise", therapy: "Therapy",
  laundry: "Laundry", shopping: "Shopping", cooking: "Cooking", "tidy-room": "Tidy the room", cleaning: "Cleaning", "walk-dog": "Walk the dog",
  doctor: "Doctor", birthday: "Birthday", errands: "Errands", travel: "Travel", "family-event": "Family event", reminder: "Reminder",
  "kids-wake-up": "Wake up", "kids-get-dressed": "Get dressed", "kids-brush-teeth": "Brush teeth", "kids-breakfast": "Breakfast",
  "kids-pack-bag": "Pack the bag", "kids-leave-home": "Leave home", "kids-kindergarten": "Preschool", "kids-school": "School",
  "kids-reading": "Reading", "kids-homework": "Homework", "kids-therapy": "Therapy", "kids-return-home": "Return home",
  "kids-lunch": "Lunch", "kids-rest": "Rest", "kids-blocks": "Play", "kids-craft": "Arts & crafts", "kids-friends": "Friends",
  "kids-playground": "Playground", "kids-swimming": "Swimming", "kids-football": "Football", "kids-dance": "Dance",
  "kids-music": "Music", "kids-gymnastics": "Gymnastics", "kids-bicycle": "Ride a bicycle", "kids-tidy-toys": "Tidy toys",
  "kids-help-cooking": "Help in the kitchen", "kids-shopping": "Shopping", "kids-walk-dog": "Walk the dog", "kids-bath": "Bath",
  "kids-pajamas": "Put on pajamas", "kids-bedtime-story": "Bedtime story", "kids-sleep": "Sleep", "kids-doctor": "Doctor",
  "kids-birthday": "Birthday", "kids-car-ride": "Car ride", "kids-screen-time": "Screen time",
};

export function weeklyBoardCategoryLabel(category, language) {
  return language === "en" ? (CATEGORY_LABELS_EN[category.id] || category.label) : category.label;
}

export function weeklyBoardTaskTitle(task, language) {
  return language === "en" ? (TASK_TITLES_EN[task.id] || task.title) : task.title;
}
