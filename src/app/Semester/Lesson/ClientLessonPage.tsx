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
import { termMap } from "@/lib/Data/terms";
import {
	getLessons,
	deleteLesson,
	createLesson,
	updateLessonsOrder,
	type Lesson,
} from "@/lib/lessons";
import { LessonButton } from "./LessonButtons";

export default function ClientLessonPage() {
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const termDisplay = searchParams.get("term") || "1年前期";
	const subjects = subjectsByTerm[termDisplay] || [];

	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);

	const [opened, setOpened] = useState(false);
	const [currentSubject, setCurrentSubject] = useState("");
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [inputLoading, setInputLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		const termForQuery = termMap[termDisplay] || termDisplay;

		Promise.all(subjects.map((subject) => getLessons(termForQuery, subject)))
			.then((results) => {
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

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setLessons((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				const newOrder = arrayMove(items, oldIndex, newIndex);

				updateLessonsOrder(newOrder)
					.then(() => {
						toast.success("順番を保存しました！");
					})
					.catch(() => {
						toast.error("順番の保存に失敗しました...");
						setLessons(items);
					});

				return newOrder;
			});
		}
	};

	const handleOpenModal = (subject: string) => {
		setCurrentSubject(subject);
		setOpened(true);
	};

	const handleAddLesson = async () => {
		if (!title.trim() || !url.trim()) {
			toast.error("タイトルとURLを入力してください");
			return;
		}

		setInputLoading(true);
		try {
			const termForQuery = termMap[termDisplay] || termDisplay;
			const newLessonData = await createLesson({
				semester: termForQuery,
				subject: currentSubject,
				title,
				url,
			});
			setLessons((prev) => [...prev, newLessonData]);
			setOpened(false);
			setTitle("");
			setUrl("");
			toast.success("教材を追加しました");
		} catch (error) {
			toast.error("教材を追加できませんでした。");
		}
		setInputLoading(false);
	};

	const handleDeleteLesson = (id: string) => {
		const originalLessons = [...lessons];
		setLessons((prev) => prev.filter((l) => l.id !== id));
		toast.success("教材を削除しました。");

		deleteLesson(id)
			.then(() => {
				const updatedLessons = originalLessons.filter((l) => l.id !== id);
				return updateLessonsOrder(updatedLessons);
			})
			.catch((error) => {
				console.error("削除処理に失敗しました:", error);
				toast.error("削除処理に失敗しました。");
				setLessons(originalLessons);
			});
	};

	if (status === "loading" || loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader color="teal" />
			</div>
		);
	}

	const userRole = session?.user?.role;

	return (
		<div className="mx-auto max-w-6xl px-4 py-8">
			<h1 className="mb-6 border-b border-gray-700 pb-2 font-serif text-2xl font-semibold tracking-wide">
				{termDisplay} の授業を選択
			</h1>

			<Modal opened={opened} onClose={() => setOpened(false)} closeOnClickOutside centered>
				<h1 className="mb-6 border-b pb-2 font-serif text-2xl font-semibold tracking-wide text-black">
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

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{subjects.map((subject) => {
					const subjectLessons = lessons
						.filter((l) => l.subject === subject)
						.sort((a, b) => a.order - b.order);

					const lessonList = (
						<div className="flex flex-col space-y-2">
							{subjectLessons.map((lesson) => (
								<LessonButton
									key={lesson.id}
									lesson={lesson}
									onDelete={handleDeleteLesson}
									role={userRole}
								/>
							))}
						</div>
					);

					return (
						<div
							key={subject}
							className="rounded-xl border border-gray-700 bg-[#1a1a1a] p-4 shadow-sm transition-all hover:shadow-md sm:p-5"
						>
							<h2 className="mb-3 flex flex-row items-center justify-between border-b border-gray-600 pb-1 font-semibold tracking-wide break-words text-base sm:text-lg">
								{subject}
								{userRole === "admin" && (
									<button onClick={() => handleOpenModal(subject)}>
										<FaCirclePlus
											className="text-white transition-colors hover:text-emerald-400"
											size={20}
										/>
									</button>
								)}
							</h2>

							{/* ▼▼▼ adminの時だけD&D機能を有効にします ▼▼▼ */}
							{userRole === "admin" ? (
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={subjectLessons.map((l) => l.id!)}
										strategy={verticalListSortingStrategy}
									>
										{lessonList}
									</SortableContext>
								</DndContext>
							) : (
								lessonList
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}