"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { subjectsByTerm } from "@/lib/Data/subjects";
import { termMap } from "@/lib/Data/terms";
import { lessonNumbers } from "@/lib/Data/lessonCounts";

export default function ClientLessonPage() {
	const searchParams = useSearchParams();
	const termDisplay = searchParams.get("term") || "1年前期";
	const termFolder = termMap[termDisplay] || "1年1期";
	const subjects = subjectsByTerm[termDisplay] || [];

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2 tracking-wide font-sans">
				{termDisplay} の授業を選択
			</h1>

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
							<h2 className="text-base sm:text-lg font-semibold mb-3 border-b border-gray-600 pb-1 tracking-wide break-words">
								{subject}
							</h2>

							<ul className="flex flex-wrap gap-3">
								{displayLessons.map((lessonNumber) => {
									const exists =
										lessons.includes(lessonNumber);
									const pdfUrl = `/api/getFile/${encodeURIComponent(termFolder)}-${encodeURIComponent(subject)}-${lessonNumber}?v=${Date.now()}`;
									const commentUrl = `/comments/${encodeURIComponent(termFolder)}/${encodeURIComponent(subject)}/${lessonNumber}`;

									return (
										<li
											key={`${subject}-${lessonNumber}`}
											className="flex items-center gap-2 min-w-[7rem]"
										>
											{exists ? (
												<>
													<a
														href={pdfUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="px-3 py-1.5 text-xs sm:text-sm bg-emerald-800 hover:bg-emerald-700 text-white rounded-md transition-all"
													>
														第{lessonNumber}回
													</a>
													<Link
														href={commentUrl}
														title="コメントを見る"
														className="text-gray-400 hover:text-emerald-300 transition-all text-lg"
													>
														💬
													</Link>
												</>
											) : (
												<>
													<span className="px-3 py-1.5 text-xs sm:text-sm bg-gray-700 text-gray-400 rounded-md cursor-not-allowed opacity-60">
														第{lessonNumber}回
													</span>
													<span className="w-5 h-5" />
												</>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					);
				})}
			</div>
		</div>
	);
}
