import * as React from "react";
import { PresetForm } from "./form";
import { Button } from "components/button";

export function WelcomeView() {

  const stableId = React.useId()

  return (
    <main className="flex flex-col flex-grow">
      <header>
        <h2>Welcome to SotaSWE</h2>
      </header>
      <div className="px-4 py-2 flex flex-col gap-2">
        <PresetForm formId={stableId} />
        <Button type="submit" variant="primary" form={stableId}>Save</Button>
      </div>
    </main>
  );
}