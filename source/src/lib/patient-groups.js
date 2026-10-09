import { cloudRequest, getCloudSession, saveCloudSession } from "@/lib/cloud-auth";

// Settings ("מסגרות") sort clients by where the therapist sees them. Only a type and a color are
// kept, never the name of a kindergarten or a school, so the list does not tell where a child is.
// They live on the therapist's account as { list: [{ id, type, color }], of: { patientId: groupId } }.
// public/therapist/my-patients/patients.js keeps the same shape, names and chosen-tab key.
export const GROUP_TYPES = [
  { id: "clinic", label: "קליניקה", labelEn: "Clinic", icon: "🏠" },
  { id: "kindergarten", label: "גן", labelEn: "Preschool", icon: "🏫" },
  { id: "school", label: "בית ספר", short: "בי״ס", labelEn: "School", icon: "🎒" },
  { id: "center", label: "מכון", labelEn: "Center", icon: "🩺" },
];
const CHOSEN_GROUP = "boo_patients_group";

export function readPatientGroups() {
  const value = getCloudSession()?.user?.user_metadata?.patient_groups;
  return {
    list: Array.isArray(value?.list) ? value.list.filter((group) => group?.id) : [],
    of: value?.of && typeof value.of === "object" ? { ...value.of } : {},
  };
}

function typeOf(group) {
  return GROUP_TYPES.find((type) => type.id === group.type) || GROUP_TYPES[0];
}
export const groupIcon = (group) => typeOf(group).icon;

// "גן" when there is one kindergarten, "גן 1" and "גן 2" when there are two.
export function groupName(group, list, language) {
  const type = typeOf(group);
  const same = list.filter((item) => typeOf(item).id === type.id);
  const base = language === "en" ? type.labelEn : (same.length > 1 && type.short) || type.label;
  return same.length > 1 ? `${base} ${same.findIndex((item) => item.id === group.id) + 1}` : base;
}

export function getChosenGroup() {
  try { return localStorage.getItem(CHOSEN_GROUP) || "all"; } catch { return "all"; }
}
export function setChosenGroup(id) {
  try { localStorage.setItem(CHOSEN_GROUP, id); } catch { /* storage blocked */ }
}

export async function savePatientGroups(groups) {
  const session = getCloudSession();
  saveCloudSession({ ...session, user: { ...session.user, user_metadata: { ...session.user?.user_metadata, patient_groups: groups } } });
  const user = await cloudRequest("/auth/v1/user", { method: "PUT", token: session.access_token, body: JSON.stringify({ data: { patient_groups: groups } }) });
  saveCloudSession({ ...getCloudSession(), user });
}

// The settings may have changed on another device, so the account is read again.
export async function loadPatientGroups() {
  const session = getCloudSession();
  try {
    const user = await cloudRequest("/auth/v1/user", { token: session.access_token });
    if (user?.id) saveCloudSession({ ...getCloudSession(), user });
  } catch { /* use what this device already knows */ }
  return readPatientGroups();
}
