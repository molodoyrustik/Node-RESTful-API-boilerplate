import _ from 'lodash';

import { AsyncRouter } from 'express-async-router';

export default (ctx) => {
  if (!_.has(ctx, 'controllers.User.get')) throw '!controllers.User.get'

	const api = AsyncRouter();

  api.get('/', ctx.controllers.User.get);

	return api;
}
