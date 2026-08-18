/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApiApp } from '../src/server/app';

// Vercel Serverless Function entry point
const app = createApiApp();

export default app;
