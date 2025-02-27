"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardCompo() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/");
        }
    }, [status, router]);

    const handleSignOut = async () => {
        try {
            await signOut({
                // redirect: true,
                // callbackUrl: "/"
            });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // if (status === "loading") {
    //     return <div>Loading...</div>;
    // }

    return (
        <div>
            <div>
                <h1>Dashboard</h1>
                <div>
                    <h2>Name: {session?.user?.name || "Not available"}</h2>
                    <h2>Email: {session?.user?.email || "Not available"}</h2>
                </div>
                <button onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
