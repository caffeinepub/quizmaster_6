import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import CreateQuiz from "./pages/CreateQuiz";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import PlayQuiz from "./pages/PlayQuiz";
import Profile from "./pages/Profile";
import ScoreScreen from "./pages/ScoreScreen";

const rootRoute = createRootRoute({
  component: () => (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.08 0.022 250), oklch(0.12 0.025 255), oklch(0.09 0.020 245))",
      }}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const createQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateQuiz,
});

const playQuizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$id",
  component: PlayQuiz,
});

const scoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$id/score",
  component: ScoreScreen,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$id/leaderboard",
  component: Leaderboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: Feed,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createQuizRoute,
  playQuizRoute,
  scoreRoute,
  leaderboardRoute,
  profileRoute,
  feedRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
