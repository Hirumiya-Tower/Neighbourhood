"use client";
import { useEffect, useState } from "react";
import { Button, Loader } from "@mantine/core";
import { getLessons, Lesson, deleteLesson } from "@/lib/lessons";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IoTrashBin } from "react-icons/io5";
import { FaCommentDots } from "react-icons/fa6";
import Link from "next/link";

interface LessonButtonsProps {
	semester: string;
	subject: string;
}

export const LessonButtons: React.FC<LessonButtonsProps> = ({
	semester,
	subject,
}) => {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				const fetchedLessons = await getLessons(semester, subject);
				console.log(semester, subject, fetchedLessons);
				setLessons(fetchedLessons);
			} catch (error) {
				console.error("Failed to fetch lessons:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLessons();
	}, [semester, subject]);

	const handleDeleteLesson = async (id: string) => {
		await deleteLesson(id);
		setLessons((prevLessons) => prevLessons.filter((l) => l.id !== id));
		toast.success("教材を削除しました。");
	};

	return (
		<>
			{lessons.map((lesson) => (
				<div
					className={"flex flex-row space-x-1 items-center"}
					key={lesson.title}
				>
					<a href={lesson.url} target={"_blank"}>
						<Button
							key={lesson.title}
							className="m-2 justify-center items-center"
							color={"teal"}
						>
							{lesson.title}
						</Button>
					</a>
					<div className={"flex flex-col space-y-1 items-center"}>
						<Link
							href={`/comments/${lesson.semester}/${lesson.subject}/${lesson.title}`}
						>
							<FaCommentDots className={"text-white"} size={15} />
						</Link>
						{session?.user.role === "admin" && (
							<div>
								<IoTrashBin
									className={"text-red-500"}
									size={15}
									onClick={() =>
										handleDeleteLesson(lesson.id || "")
									}
								/>
							</div>
						)}
					</div>
				</div>
			))}
		</>
	);
};
