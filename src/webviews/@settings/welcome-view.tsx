import * as React from "react";
import { PresetForm } from "./form";

export type WelcomeViewProps = {}

export function WelcomeView(props: WelcomeViewProps) {

  return (
    <main className="flex flex-col flex-grow">
      <header>
        <h2>Welcome to SotaSWE</h2>
      </header>
      <div className="px-4 py-2 flex flex-col gap-2">
        <PresetForm />
      </div>
    </main>
  );
}