"use client";

import { Button } from "@mantine/core";
import type { Lesson } from "@/lib/lessons";
import { FaCommentDots, FaGripVertical } from "react-icons/fa6";
import { IoTrashBin } from "react-icons/io5";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LessonButtonProps {
	lesson: Lesson;
	onDelete: (id:string) => void;
	role?: string; // ◀︎ "user" | "admin" から、もっと広い意味の string に変更しました！
}

export const LessonButton: React.FC<LessonButtonProps> = ({
															  lesson,
															  onDelete,
															  role,
														  }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: lesson.id!, disabled: role !== "admin" }); // ◀︎ adminでなければD&Dを無効化

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className="flex flex-row items-center space-x-2 rounded-lg bg-[#2a2a2a] p-2"
		>
			{/* ▼▼▼ adminの時だけ、並べ替えハンドルを表示します ▼▼▼ */}
			{role === "admin" ? (
				<div {...listeners} className="touch-none cursor-grab p-1">
					<FaGripVertical className={"text-gray-400"} />
				</div>
			) : (
				// adminでない場合は、スペースを確保するためだけの空のdivを置きます
				<div className="p-1 w-[24px]"></div>
			)}

			<a href={lesson.url} target="_blank" rel="noopener noreferrer" className="flex-grow">
				<Button color={"teal"} size="sm" fullWidth>{lesson.title}</Button>
			</a>
			<div className={"flex flex-row items-center space-x-3"}>
				<Link
					href={`/comments/${lesson.semester}/${lesson.subject}/${lesson.title}`}
				>
					<FaCommentDots className={"text-white hover:text-emerald-300 transition-colors"} size={16} />
				</Link>
				{role === "admin" && (
					<button onClick={() => onDelete(lesson.id!)}>
						<IoTrashBin
							className={"text-red-500 hover:text-red-300 transition-colors"}
							size={16}
						/>
					</button>
				)}
			</div>
		</div>
	);
};