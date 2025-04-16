"use client";

import { useSearchParams } from "next/navigation";
import { subjectsByTerm } from "@/lib/Data/subjects";
import { termMap } from "@/lib/Data/terms";
import { lessonNumbers } from "@/lib/Data/lessonCounts";
import { useSession } from "next-auth/react";
import { FaCirclePlus } from "react-icons/fa6";
import { toast } from "sonner";
import { Modal, TextInput, Button, Loader } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createLesson } from "@/lib/lessons";
import { LessonButtons } from "./LessonButtons";

export default function ClientLessonPage() {
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();
	const termDisplay = searchParams.get("term") || "1年前期";
	const termFolder = termMap[termDisplay] || "1年1期";
	const subjects = subjectsByTerm[termDisplay] || [];
	const router = useRouter();

	const [opened, setOpened] = useState(false);
	const [currentSubject, setCurrentSubject] = useState("");
	const [title, setTitle] = useState("");
	const [url, setUrl] = useState("");
	const [inputLoading, setInputLoading] = useState(false);

	const handleCreateLesson = (subject: string) => {
		setCurrentSubject(subject);
		setOpened(true);
	};

	const handleAddLesson = async () => {
		if (!title.trim() || !url.trim())
			return toast.error("タイトルとURLを入力してください");
		setInputLoading(true);
		try {
			await createLesson({
				semester: termDisplay,
				subject: currentSubject,
				title,
				url,
			});
			setOpened(false);

			setTitle("");
			setUrl("");
			toast.success("教材を追加しました");
			setTimeout(() => window.location.reload());
			3000;
		} catch (error) {
			setOpened(false);
			toast.error("教材を追加できませんでした。");
		}
		setInputLoading(false);
	};

	if (status === "loading") {
		return (
			<div className={"flex justify-center items-center h-screen"}>
				<Loader color={"teal"} />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2 tracking-wide font-serif">
				{termDisplay} の科目とコマを選択
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
				<Button
					onClick={() => handleAddLesson()}
					loading={inputLoading}
				>
					追加
				</Button>
			</Modal>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{subjects.map((subject) => {
					const lessons = lessonNumbers[subject] || [];
					const maxLesson = Math.max(...lessons, 0);
					const displayLessons = Array.from(
						{ length: maxLesson },
						(_, i) => i + 1,
					);

					return (
						<div
							key={subject}
							className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
						>
							<h2 className="text-base sm:text-lg font-semibold mb-3 border-b border-gray-600 pb-1 tracking-wide break-words flex flex-row justify-between items-center">
								{subject}
								{session?.user.role === "admin" && (
									<div>
										<FaCirclePlus
											className={"text-white"}
											size={20}
											onClick={() =>
												handleCreateLesson(subject)
											}
										/>
									</div>
								)}
							</h2>

							<div className="flex flex-wrap gap-3">
								<LessonButtons
									semester={termDisplay}
									subject={subject}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
