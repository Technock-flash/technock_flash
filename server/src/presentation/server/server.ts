import { createServer } from "http";
import { app } from "./app";
import { env } from "../../config/env";

const port = env.port;

const httpServer = createServer(app);

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`ZimMarket backend running on http://localhost:${port}`);
});

