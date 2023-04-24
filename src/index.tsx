import { createRoot } from "react-dom/client";
import { ReactQueryDemo } from "./react-query-demo";
import { ReduxDemo } from "./redux-demo";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <div>
    {/* <ReactQueryDemo /> */}
    <ReduxDemo />
  </div>
);
