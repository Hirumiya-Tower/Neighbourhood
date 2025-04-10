"use client";

type LinkItem = {
	label: string;
	url: string;
	icon?: string;
};

const links: LinkItem[] = [
	{
		label: "昼水夜塔のGitHub",
		url: "https://github.com/Hirumiya-Tower",
	},
	{
		label: "Next.js",
		url: "https://nextjs.org/",
	},
	{
		label: "Tailwind CSS",
		url: "https://tailwindcss.com/",
	},
	{
		label: "お問い合わせ、ご相談はこちら",
		url: "mailto:tomo0096jp@gmail.com",
	},
];

export default function LinksPage() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2 tracking-wide font-sans">
				リンク集
			</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{links.map((link) => (
					<a
						key={link.url}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						className="block bg-[#1a1a1a] border border-gray-700 hover:border-emerald-600 hover:bg-emerald-950 transition-all rounded-xl p-5 shadow-sm hover:shadow-md"
					>
						<div className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
							{link.icon && (
								<span className="text-xl">{link.icon}</span>
							)}
							<span className="break-all">{link.label}</span>
						</div>
						<p className="mt-1 text-sm text-gray-400 break-all">
							{link.url}
						</p>
					</a>
				))}
			</div>
		</div>
	);
}
