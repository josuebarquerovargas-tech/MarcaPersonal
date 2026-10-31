export type Access = "FREE" | "MEMBERS";

export function canWatch(video: { access: Access }, membership: { active: boolean }): boolean {
  return video.access === "FREE" || membership.active;
}
