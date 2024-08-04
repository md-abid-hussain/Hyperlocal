import { Worker, Job } from 'bullmq';
import { sendVerificationEmail } from '../utils/sendMail';
import { connection } from '../config/redisConfig';

const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    await sendVerificationEmail(job.data.to, job.data.token);
    return job.data.to;
  },
  {
    connection,
  },
);

emailWorker.on('completed', (job: Job) => {
  console.log(`Job completed with result: Email sent to ${job.returnvalue}`);
});
