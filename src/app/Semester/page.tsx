import Link from "next/link";

const terms = ["1年前期", "1年後期", "2年前期", "2年後期"];

export default function SemesterPage() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2 tracking-wide font-sans">
				学期を選択
			</h1>

			<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{terms.map((term) => (
					<li key={term}>
						<Link
							href={`/Semester/Lesson?term=${encodeURIComponent(term)}`}
							className="block bg-[#1a1a1a] border border-gray-700 hover:border-emerald-600 hover:bg-emerald-950 rounded-xl px-4 py-5 sm:p-6 text-center text-base sm:text-lg font-medium tracking-wider transition-all duration-200 shadow-sm hover:shadow-lg"
						>
							{term}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
