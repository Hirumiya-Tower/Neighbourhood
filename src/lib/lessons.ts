import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";

export type Lesson = {
	semester: string;
	subject: string;
	title: string;
	url: string;
	id?: string;
};

export async function getLessons(semester: string, subject: string) {
	try {
		const lessonsRef = collection(db, "lessons");
		const q = query(
			lessonsRef,
			where("semester", "==", semester),
			where("subject", "==", subject),
		);

		const querySnapshot = await getDocs(q);
		const lessons: Lesson[] = [];

		querySnapshot.forEach((doc) => {
			lessons.push({ id: doc.id, ...doc.data() } as unknown as Lesson);
		});

		return lessons;
	} catch (error) {
		console.error("Error fetching lessons:", error);
		throw error;
	}
}

export async function createLesson(lessonData: Lesson) {
	try {
		const lessonsRef = collection(db, "lessons");
		const docRef = await addDoc(lessonsRef, lessonData);
		return { id: docRef.id, ...lessonData };
	} catch (error) {
		console.error("Error creating lesson:", error);
		throw error;
	}
}

export async function deleteLesson(lessonId: string) {
	try {
		const lessonRef = doc(db, "lessons", lessonId);
		await deleteDoc(lessonRef);
	} catch (error) {
		console.error("Error deleting lesson:", error);
		throw error;
	}
}
