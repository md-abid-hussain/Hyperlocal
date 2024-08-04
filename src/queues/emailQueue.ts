import { Queue } from 'bullmq';
import { connection } from '../config/redisConfig';

type VerifyEmailJobData = {
  to: string;
  subject: string;
  text: string;
};

const emailQueue = new Queue('email', { connection });

export async function addSendEmailVerificationJob({ to, subject, text }: VerifyEmailJobData) {
  console.log('Adding email job to queue');
  await emailQueue.add(
    'send-email',
    { to, subject, text },
    {
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}
