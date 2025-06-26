"use client";

import { Button } from "@mantine/core";
import type { Lesson } from "@/lib/lessons";
import { useSession } from "next-auth/react";
import { IoTrashBin } from "react-icons/io5";
import { FaCommentDots, FaGripVertical } from "react-icons/fa6"; // ← FaGripVertical を追加！
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LessonButtonProps {
	lesson: Lesson;
	onDelete: (id: string) => void;
}

export const LessonButton: React.FC<LessonButtonProps> = ({
															  lesson,
															  onDelete,
														  }) => {
	const { data: session } = useSession();

	const {
		attributes,
		listeners, // ←並べ替えのリスナー
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: lesson.id! });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		// ↓↓↓ このdivからは `listeners` を削除します
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={"flex flex-row space-x-2 items-center touch-none bg-[#2a2a2a] p-2 rounded-lg"}
		>
			{/* ★★★ このハンドルを追加！ ★★★ */}
			{/* このハンドルを掴んだ時だけ、並べ替えができるようになります！ */}
			<div {...listeners} className="cursor-grab touch-none p-1">
				<FaGripVertical className={"text-gray-400"} />
			</div>

			<a href={lesson.url} target={"_blank"} rel="noopener noreferrer">
				<Button color={"teal"} size="sm">{lesson.title}</Button>
			</a>
			<div className={"flex flex-row space-x-3 items-center"}>
				<Link
					href={`/comments/${lesson.semester}/${lesson.subject}/${lesson.title}`}
				>
					<FaCommentDots className={"text-white hover:text-emerald-300 transition-colors"} size={16} />
				</Link>
				{session?.user.role === "admin" && (
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