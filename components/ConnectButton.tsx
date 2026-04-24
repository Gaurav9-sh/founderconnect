import { connectAction } from '@/app/actions';
import { Button } from './ui/Button';

export function ConnectButton({
  receiverId,
  status,
}: {
  receiverId: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
}) {
  if (status === 'ACCEPTED') {
    return (
      <Button variant="secondary" size="sm" disabled>
        Connected
      </Button>
    );
  }
  if (status === 'PENDING') {
    return (
      <Button variant="secondary" size="sm" disabled>
        Request sent
      </Button>
    );
  }
  return (
    <form action={connectAction}>
      <input type="hidden" name="receiverId" value={receiverId} />
      <Button size="sm">Connect</Button>
    </form>
  );
}
