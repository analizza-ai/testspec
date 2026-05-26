/**
 * src/utils/logger.js
 * Thin logger with coloured output via chalk.
 */

import chalk from 'chalk';

export const log = {
  info: (msg) => console.log(chalk.cyan(msg)),
  success: (msg) => console.log(chalk.green('✔ ' + msg)),
  warn: (msg) => console.warn(chalk.yellow('⚠ ' + msg)),
  error: (msg) => console.error(chalk.red('✖ ' + msg)),
};
