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
import { OwnerProvider } from "./contexts/OwnerContext";
import AdminPanel from "./pages/AdminPanel";
import BuyPoints from "./pages/BuyPoints";
import Chat from "./pages/Chat";
import CreateQuiz from "./pages/CreateQuiz";
import CustomGamePage from "./pages/CustomGamePage";
import Feed from "./pages/Feed";
import GamesHub from "./pages/GamesHub";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import MemoryGame from "./pages/MemoryGame";
import PlayQuiz from "./pages/PlayQuiz";
import PointsLeaderboard from "./pages/PointsLeaderboard";
import PrivateChat from "./pages/PrivateChat";
import PrivateMessages from "./pages/PrivateMessages";
import Profile from "./pages/Profile";
import RanksLeaderboard from "./pages/RanksLeaderboard";
import ScoreScreen from "./pages/ScoreScreen";
import SpinWheel from "./pages/SpinWheel";

const rootRoute = createRootRoute({
  component: () => (
    <OwnerProvider>
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
    </OwnerProvider>
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

const gamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games",
  component: GamesHub,
});

const memoryGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/memory",
  component: MemoryGame,
});

const spinWheelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/spinwheel",
  component: SpinWheel,
});

const customGameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/custom/$id",
  component: CustomGamePage,
});

const pointsLeaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/points-leaderboard",
  component: PointsLeaderboard,
});

const ranksLeaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ranks-leaderboard",
  component: RanksLeaderboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPanel,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: Chat,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: PrivateMessages,
});

const privateChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages/$userId",
  component: PrivateChat,
});

const buyPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buy-points",
  component: BuyPoints,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createQuizRoute,
  playQuizRoute,
  scoreRoute,
  leaderboardRoute,
  profileRoute,
  feedRoute,
  gamesRoute,
  memoryGameRoute,
  spinWheelRoute,
  customGameRoute,
  pointsLeaderboardRoute,
  ranksLeaderboardRoute,
  adminRoute,
  chatRoute,
  messagesRoute,
  privateChatRoute,
  buyPointsRoute,
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
