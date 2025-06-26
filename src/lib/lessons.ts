import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	getCountFromServer,
	orderBy,
	deleteDoc,
	writeBatch,
	doc,
} from "firebase/firestore";

export type Lesson = {
	semester: string;
	subject: string;
	title: string;
	url: string;
	order: number;
	id?: string;
};

export async function updateLessonsOrder(lessons: Lesson[]) {
	try {
		const batch = writeBatch(db);
		lessons.forEach((lesson, index) => {
			if (lesson.id) {
				const lessonRef = doc(db, "lessons", lesson.id);
				batch.update(lessonRef, { order: index }); // ◀ 新しい順番(index)を order に設定
			}
		});
		await batch.commit(); // ◀ 変更をまとめて保存！
	} catch (error) {
		console.error("Error updating lessons order:", error);
		throw error;
	}
}

export async function getLessons(semester: string, subject: string) {
	try {
		const lessonsRef = collection(db, "lessons");
		const q = query(
			lessonsRef,
			where("semester", "==", semester),
			where("subject", "==", subject),
			orderBy("order", "asc")
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

export async function createLesson(
	// 引数の型を Omit を使って「idとorder以外」という意味に修正します！
	lessonData: Omit<Lesson, "id" | "order">,
) {
	try {
		const lessonsRef = collection(db, "lessons");

		// 同じ学期・科目の教材がいくつあるか数えます
		const q = query(
			lessonsRef,
			where("semester", "==", lessonData.semester),
			where("subject", "==", lessonData.subject),
		);
		const snapshot = await getCountFromServer(q);
		const currentCount = snapshot.data().count;

		// 保存するデータに、計算した order を追加します
		const lessonToSave: Omit<Lesson, "id"> = {
			...lessonData,
			order: currentCount,
		};

		const docRef = await addDoc(lessonsRef, lessonToSave);
		// 戻り値は id を含んだ完全な Lesson 型になります
		return { id: docRef.id, ...lessonToSave };
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
