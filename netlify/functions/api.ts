// YOUR_BASE_DIRECTORY/netlify/functions/api.ts

import app from "../../src/index";
import serverless from "serverless-http";


export const handler = serverless(app);