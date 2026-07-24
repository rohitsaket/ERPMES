import 'reflect-metadata';

async function bootstrap(): Promise<void> {
  // Queue workers are registered by @diamondflow/queue when concrete worker
  // modules are added to this application.
}

void bootstrap();
