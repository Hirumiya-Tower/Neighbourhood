"use client";

import { useEffect, useState } from "react";
import { Button, Loader } from "@mantine/core";
import { getLessons, Lesson, deleteLesson } from "@/lib/lessons";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IoTrashBin } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa6";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LessonButtonProps {
	lesson: Lesson;
	onDelete: (id: string) => void;
}

export const LessonButton: React.FC<LessonButtonProps> = ({ lesson, onDelete }) => {
	const { data: session } = useSession();

	// dnd-kitの魔法！
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: lesson.id! });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={"flex flex-row space-x-1 items-center touch-none"}>
			{/* ↑ このdivがドラッグ対象になります */}
			<a href={lesson.url} target={"_blank"}>
				<Button color={"teal"}>{lesson.title}</Button>
			</a>
			<div className={"flex flex-col space-y-1 items-center"}>
				<Link href={`/comments/<span class="math-inline">\{lesson\.semester\}/</span>{lesson.subject}/${lesson.title}`}>
					<FaCommentDots className={"text-white"} size={15} />
				</Link>
				{session?.user.role === "admin" && (
					<div>
						<IoTrashBin
							className={"text-red-500 cursor-pointer"}
							size={15}
							onClick={() => onDelete(lesson.id!)}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
