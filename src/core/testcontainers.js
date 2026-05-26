/**
 * src/core/testcontainers.js
 * Builds Testcontainers container setup snippets from stack config.
 * Used by stub-generator to pre-configure the right container images.
 */

/**
 * @param {{ lang: string, db: string, broker: string|null }} stack
 * @returns {{ imports: string, setup: string, teardown: string }}
 */
export function buildContainerSetup(stack) {
  const imports = [];
  const setupLines = [];
  const teardownLines = [];

  if (stack.db === 'postgresql') {
    imports.push("import { PostgreSqlContainer } from '@testcontainers/postgresql';");
    setupLines.push(
      "container = await new PostgreSqlContainer('postgres:16-alpine').start();",
      'connectionString = container.getConnectionUri();',
    );
    teardownLines.push('await container.stop();');
  }

  if (stack.broker === 'kafka') {
    imports.push("import { KafkaContainer } from '@testcontainers/kafka';");
    setupLines.push(
      "kafkaContainer = await new KafkaContainer('confluentinc/cp-kafka:7.4.0').start();",
      'brokerUrl = `${kafkaContainer.getHost()}:${kafkaContainer.getMappedPort(9093)}`;',
    );
    teardownLines.push('await kafkaContainer.stop();');
  }

  return {
    imports: imports.join('\n'),
    setup: setupLines.join('\n    '),
    teardown: teardownLines.join('\n    '),
  };
}
