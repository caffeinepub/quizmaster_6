import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // ─── Old types (from previous main.mo) ───────────────────────────────────

  type OldUserProfile = { username : Text };

  type OldMiniGameType = { #spinWheel; #memoryGame };

  type OldMiniGameCooldown = {
    lastPlayed : Time.Time;
    gameType : OldMiniGameType;
  };

  // AccessControl internal state shape (from authorization/access-control.mo)
  type OldUserRole = { #admin; #user; #guest };
  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, OldUserRole>;
  };

  type OldActor = {
    // Fields we need to transform
    userProfiles : Map.Map<Principal, OldUserProfile>;
    miniGameCooldowns : Map.Map<Principal, [OldMiniGameCooldown]>;
    // Fields we need to drop (consumed but not produced)
    accessControlState : OldAccessControlState;
    ownerPrincipal : ?Principal;
  };

  // ─── New types (matching new main.mo fields) ──────────────────────────────

  type NewUserProfile = { username : Text; isVip : Bool };

  type NewCooldownEntry = { gameKey : Text; lastPlayed : Time.Time };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    cooldowns : Map.Map<Principal, [NewCooldownEntry]>;
  };

  // ─── Migration function ───────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    // Migrate userProfiles: add isVip = false to each profile
    let userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, oldProfile) {
        { username = oldProfile.username; isVip = false }
      }
    );

    // Migrate miniGameCooldowns: convert [OldMiniGameCooldown] -> [NewCooldownEntry]
    let cooldowns = old.miniGameCooldowns.map<Principal, [OldMiniGameCooldown], [NewCooldownEntry]>(
      func(_p, oldEntries) {
        oldEntries.map(func(e : OldMiniGameCooldown) : NewCooldownEntry {
          let key = switch (e.gameType) {
            case (#spinWheel) { "spinWheel" };
            case (#memoryGame) { "memoryGame" };
          };
          { gameKey = key; lastPlayed = e.lastPlayed }
        })
      }
    );

    // Return only the fields we produce (others come from new actor initializers)
    { userProfiles; cooldowns }
  };
};
