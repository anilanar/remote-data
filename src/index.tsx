import { createRoot } from "react-dom/client";
import { ReactQueryDemo } from "./react-query-demo";

import { RemoteDataDemo } from "./remote-data-demo";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <div>
    <RemoteDataDemo />
    <ReactQueryDemo />
  </div>
);