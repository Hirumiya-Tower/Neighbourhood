"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Modal, TextInput, Button, Loader } from "@mantine/core";
import { toast } from "sonner";
import { FaCirclePlus } from "react-icons/fa6";

import { subjectsByTerm } from "@/lib/Data/subjects";
import {
	getLessons,
	deleteLesson,
	createLesson,
	updateLessonsOrder,
	type Lesson,
} from "@/lib/lessons";
import { LessonButton } from "./LessonButtons"; // 私たちが作った新しいコンポーネントです！

export default function ClientLessonPage() {
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const termDisplay = searchParams.get("term") || "1年前期";
	const subjects = subjectsByTerm[termDisplay] || [];

	// このページで表示する全ての教材をここで管理します
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);

	// --- Modal用のStateです ---
	const [opened, setOpened] = useState(false);
	const [currentSubject, setCurrentSubject] = useState("");
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [inputLoading, setInputLoading] = useState(false);

	// 最初に全ての教材データを取得します
	useEffect(() => {
		setLoading(true);
		Promise.all(
			subjects.map((subject) => getLessons(termDisplay, subject)),
		)
			.then((results) => {
				// 各科目の教材を一つの配列にまとめます
				const allLessons = results.flat();
				setLessons(allLessons);
			})
			.catch((error) => {
				console.error("Failed to fetch lessons:", error);
				toast.error("教材の読み込みに失敗しました。");
			})
			.finally(() => {
				setLoading(false);
			});
	}, [termDisplay, subjects]);

	// --- ドラッグ＆ドロップの処理です ---
	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setLessons((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				const newOrder = arrayMove(items, oldIndex, newIndex);

				// データベースに新しい順番を保存します！
				updateLessonsOrder(newOrder)
					.then(() => {
						toast.success("順番を保存しました！");
					})
					.catch(() => {
						toast.error("順番の保存に失敗しました...");
						setLessons(items); // 失敗したら元の順番に戻します
					});

				return newOrder;
			});
		}
	};

	// --- 教材の追加・削除の処理です ---
	const handleOpenModal = (subject: string) => {
		setCurrentSubject(subject);
		setOpened(true);
	};

	const handleAddLesson = async () => {
		if (!title.trim() || !url.trim())
			return toast.error("タイトルとURLを入力してください");

		setInputLoading(true);
		try {
			const newLesson = await createLesson({
				semester: termDisplay,
				subject: currentSubject,
				title,
				url,
			});
			setLessons((prev) => [...prev, newLesson]); // ページをリロードせずに画面を更新！
			setOpened(false);
			setTitle("");
			setUrl("");
			toast.success("教材を追加しました");
		} catch (error) {
			toast.error("教材を追加できませんでした。");
		}
		setInputLoading(false);
	};

	const handleDeleteLesson = async (id: string) => {
		// 画面から先に消して、操作を快適にします
		const originalLessons = [...lessons];
		setLessons((prev) => prev.filter((l) => l.id !== id));
		toast.success("教材を削除しました。");

		try {
			await deleteLesson(id);
			// 順番を更新します
			const updatedLessons = lessons.filter((l) => l.id !== id);
			await updateLessonsOrder(updatedLessons);
		} catch (error) {
			toast.error("削除処理に失敗しました。画面を更新します。");
			setLessons(originalLessons); // 失敗したら元に戻します
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className={"flex justify-center items-center h-screen"}>
				<Loader color={"teal"} />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2 tracking-wide font-serif">
				{termDisplay} の授業を選択
			</h1>

			<Modal
				opened={opened}
				onClose={() => setOpened(false)}
				closeOnClickOutside
				centered
			>
				<h1 className="text-2xl font-semibold mb-6 border-b pb-2 tracking-wide font-serif text-black">
					{termDisplay} {currentSubject}の教材を追加
				</h1>
				<TextInput
					label="教材のタイトル"
					value={title}
					onChange={(e) => setTitle(e.currentTarget.value)}
					className="mb-4 text-black"
				/>
				<TextInput
					label="教材のURL"
					value={url}
					onChange={(e) => setUrl(e.currentTarget.value)}
					className="mb-4 text-black"
				/>
				<Button onClick={handleAddLesson} loading={inputLoading}>
					追加
				</Button>
			</Modal>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{subjects.map((subject) => {
					// 表示する科目の教材だけをフィルタリングして、順番に並べます
					const subjectLessons = lessons
						.filter((l) => l.subject === subject)
						.sort((a, b) => a.order - b.order);

					return (
						<div
							key={subject}
							className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
						>
							<h2 className="text-base sm:text-lg font-semibold mb-3 border-b border-gray-600 pb-1 tracking-wide break-words flex flex-row justify-between items-center">
								{subject}
								{session?.user.role === "admin" && (
									<button onClick={() => handleOpenModal(subject)}>
										<FaCirclePlus
											className={"text-white hover:text-emerald-400 transition-colors"}
											size={20}
										/>
									</button>
								)}
							</h2>

							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={subjectLessons.map((l) => l.id!)}
									strategy={verticalListSortingStrategy}
								>
									<div className="flex flex-col space-y-3">
										{subjectLessons.map((lesson) => (
											<LessonButton
												key={lesson.id}
												lesson={lesson}
												onDelete={handleDeleteLesson}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>
						</div>
					);
				})}
			</div>
		</div>
	);
}