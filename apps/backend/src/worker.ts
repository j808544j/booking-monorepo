import { run } from 'graphile-worker';
import { config } from './config';
import { logger } from './logger';
import { sendNotificationTask } from './workers/notificationTasks';

async function main() {
  const runner = await run({
    connectionString: config.databaseUrl,
    concurrency: 5,
    pollInterval: 5000,
    taskList: {
      send_notification: (payload, _helpers) => sendNotificationTask(payload),
    },
  });

  logger.info('Worker started', {
    concurrency: 5,
    pollInterval: 5000,
  });

  await runner.promise;
}

main().catch((err) => {
  logger.error('Worker crashed', {
    errorMessage: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
