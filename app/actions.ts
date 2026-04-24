'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { sendRequest, respondToRequest } from '@/services/connectionService';
import { createStartup, expressInterest } from '@/services/startupService';
import { sendMessage } from '@/services/messageService';
import { upsertProfile } from '@/services/userService';
import {
  createPost,
  forwardPost,
  toggleLike,
  addComment,
} from '@/services/postService';

export async function connectAction(formData: FormData) {
  const user = await requireUser();
  await sendRequest(user.id, {
    receiverId: String(formData.get('receiverId')),
    message: String(formData.get('message') ?? ''),
  });
  revalidatePath('/feed');
  revalidatePath('/connections');
}

export async function respondConnectionAction(formData: FormData) {
  const user = await requireUser();
  await respondToRequest(
    user.id,
    String(formData.get('id')),
    formData.get('accept') === 'true',
  );
  revalidatePath('/connections');
  revalidatePath('/dashboard');
}

export async function createStartupAction(formData: FormData) {
  const user = await requireUser();
  await createStartup(user.id, {
    name: formData.get('name'),
    tagline: formData.get('tagline'),
    description: formData.get('description'),
    category: formData.get('category'),
    stage: formData.get('stage'),
    location: formData.get('location'),
    website: formData.get('website'),
    fundingGoal: formData.get('fundingGoal') || null,
    traction: formData.get('traction'),
  });
  revalidatePath('/startups');
  revalidatePath('/dashboard');
}

export async function expressInterestAction(formData: FormData) {
  const user = await requireUser();
  await expressInterest(
    user.id,
    String(formData.get('startupId')),
    String(formData.get('note') ?? '') || undefined,
  );
  revalidatePath(`/startups/${formData.get('startupId')}`);
  revalidatePath('/dashboard');
}

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  await sendMessage(user.id, {
    receiverId: String(formData.get('receiverId')),
    body: String(formData.get('body')),
  });
  revalidatePath(`/messages/${formData.get('receiverId')}`);
  revalidatePath('/messages');
}

export async function saveProfileAction(formData: FormData) {
  const user = await requireUser();
  await upsertProfile(user.id, Object.fromEntries(formData));
  revalidatePath(`/profile/${user.id}`);
  revalidatePath('/dashboard');
}

export async function createPostAction(formData: FormData) {
  const user = await requireUser();
  await createPost(user.id, {
    body: formData.get('body'),
    imageUrl: formData.get('imageUrl'),
  });
  revalidatePath('/feed');
}

export async function toggleLikeAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get('postId'));
  await toggleLike(user.id, postId);
  revalidatePath('/feed');
  revalidatePath(`/posts/${postId}`);
}

export async function commentAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get('postId'));
  await addComment(user.id, { postId, body: formData.get('body') });
  revalidatePath('/feed');
  revalidatePath(`/posts/${postId}`);
}

export async function forwardAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get('postId'));
  const body = formData.get('body');
  await forwardPost(user.id, postId, typeof body === 'string' ? body : undefined);
  revalidatePath('/feed');
  revalidatePath(`/posts/${postId}`);
}
