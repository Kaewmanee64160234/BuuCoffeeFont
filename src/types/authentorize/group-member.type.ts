// group-member.type.ts
import type Groups from "./group.type";
import type { User } from "./user.type";

export default interface GroupMember {
  groupMemberId: number;
  group: Groups;
  user: User;
}
