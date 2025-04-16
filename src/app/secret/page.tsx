import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserCreationForm from "@/ui/UserCreationForm";
import { listUsers, NewUser } from "@/lib/user-management";
import { Table } from "@mantine/core";

type UserWithId = NewUser & { id: string };

export default async function Secret() {
	const session = await auth();
	if (session?.user.role !== "admin") {
		redirect("/Semester");
	}
	return (
		<div>
			<UserCreationForm />
		</div>
	);
}
