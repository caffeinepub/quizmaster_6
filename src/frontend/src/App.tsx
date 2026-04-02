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
import SpaceBackground from "./components/SpaceBackground";
import { BanProvider } from "./contexts/BanContext";
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
      <BanProvider>
        {/* Fixed background layer -- sits behind everything */}
        <SpaceBackground />
        {/* App shell -- sits on top of background */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Navbar />
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
          <Footer />
          <Toaster />
        </div>
      </BanProvider>
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
