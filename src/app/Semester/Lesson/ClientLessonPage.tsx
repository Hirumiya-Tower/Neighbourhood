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
import { LessonButton } from "@/app/Semester/Lesson/LessonButtons";

export default function ClientLessonPage() {
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const termDisplay = searchParams.get("term") || "1年前期";
	const subjects = subjectsByTerm[termDisplay] || [];

	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);

	// Modal state
	const [opened, setOpened] = useState(false);
	const [currentSubject, setCurrentSubject] = useState("");
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [inputLoading, setInputLoading] = useState(false);

	// 初回フェッチ
	useEffect(() => {
		setLoading(true);
		Promise.all(subjects.map((subj) => getLessons(termDisplay, subj)))
			.then((results) => setLessons(results.flat()))
			.catch((e) => {
				console.error(e);
				toast.error("教材の読み込みに失敗しました。");
			})
			.finally(() => setLoading(false));
	}, [termDisplay, subjects]);

	// Drag & Drop
	const sensors = useSensors(useSensor(PointerSensor));
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setLessons((items) => {
				const oldIndex = items.findIndex((i) => i.id === active.id);
				const newIndex = items.findIndex((i) => i.id === over.id);
				const newOrder = arrayMove(items, oldIndex, newIndex);

				updateLessonsOrder(newOrder)
					.then(() => toast.success("順番を保存しました！"))
					.catch(() => {
						toast.error("順番の保存に失敗しました...");
						setLessons(items);
					});

				return newOrder;
			});
		}
	};

	// 追加モーダル
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
			setLessons((prev) => [...prev, newLesson]);
			setOpened(false);
			setTitle("");
			setUrl("");
			toast.success("教材を追加しました");
		} catch {
			toast.error("教材を追加できませんでした。");
		} finally {
			setInputLoading(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader color="teal" />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			{/* 省略：ヘッダーやモーダル部分はそのまま */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{subjects.map((subject) => {
					const subjectLessons = lessons
						.filter((l) => l.subject === subject)
						.sort((a, b) => a.order - b.order);

					return (
						<div
							key={subject}
							className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shadow-sm"
						>
							<h2 className="flex justify-between items-center mb-3">
								{subject}
								{session?.user.role === "admin" && (
									<button onClick={() => handleOpenModal(subject)}>
										<FaCirclePlus
											className="text-white hover:text-emerald-400"
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
									{/* ↓↓↓ ここのclassNameを修正します！ ↓↓↓ */}
									<div className="flex flex-wrap gap-3">
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