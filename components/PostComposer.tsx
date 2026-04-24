import { createPostAction } from '@/app/actions';
import { Card, CardBody, Avatar } from './ui/Card';
import { Textarea } from './ui/Input';
import { Button } from './ui/Button';

export function PostComposer({ authorName }: { authorName: string }) {
  return (
    <Card>
      <CardBody>
        <form action={createPostAction} className="flex gap-3">
          <Avatar name={authorName} size={40} />
          <div className="flex-1 space-y-2">
            <Textarea
              name="body"
              required
              maxLength={5000}
              placeholder="Share an update, ask for advice, post an opportunity…"
              className="min-h-[80px]"
            />
            <div className="flex items-center justify-end">
              <Button type="submit" size="sm">Post</Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
