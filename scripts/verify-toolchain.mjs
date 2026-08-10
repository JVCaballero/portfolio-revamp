const requiredNode = '24.19.0';
const requiredPnpm = '11.17.0';

if (process.versions.node !== requiredNode) {
  console.error(
    `Node mismatch: expected ${requiredNode}, got ${process.versions.node}.`,
  );
  process.exitCode = 1;
}

const userAgent = process.env.npm_config_user_agent ?? '';
if (userAgent && !userAgent.startsWith(`pnpm/${requiredPnpm} `)) {
  console.error(
    `pnpm mismatch: expected ${requiredPnpm}, user agent is ${userAgent}.`,
  );
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(`Toolchain OK: Node ${requiredNode}; pnpm ${requiredPnpm}.`);
}
