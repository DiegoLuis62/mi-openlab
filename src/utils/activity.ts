import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

export async function addActivity(userId: string, type: string, message: string) {
  const ref = doc(db, "users", userId);
  const activity = {
    type,
    message,
    timestamp: new Date().toISOString(),
  };
  await setDoc(ref, {
    lastActivity: activity.timestamp,
    activityLog: arrayUnion(activity),
  }, { merge: true });
}

