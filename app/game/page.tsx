"use client";

import { RadialTimer } from "@/components/radial-timer";

const words = (await (await fetch("assets/wordlist.txt")).text()).split("\r\n");
const syllables = await (await fetch("assets/syllables.json")).json();

export default function Page() {
    return (
        <div>
            <RadialTimer />
        </div>
    );
}