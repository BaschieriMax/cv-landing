import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/react-query";
import { RouterProvider } from "react-router/dom";
import { router } from "./routes/router";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
