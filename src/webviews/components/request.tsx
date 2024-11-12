import { Request } from "model";

export function RequestViewItem({ username, message }: Request) {
  return (
    <div>
      <p>{username}</p>
      <p>{message}</p>
    </div>
  );
}
