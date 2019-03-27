import { AsyncRouter } from 'express-async-router';
import expressJwt from 'express-jwt';
import getAuth from './auth';
import getUser from './user';


export default (ctx) => {
	const api = AsyncRouter();

  api.all('/', () => ({ok: true, version: '1.0.1'}))

  api.use('/auth', getAuth(ctx));
	api.use('/users', expressJwt({secret: ctx.config.jwt.secret}), getUser(ctx));

	api.use('/', (err, req, res, next) => {
		return res.status(401).json([{ flag: false, message: 'Не авторизован' }])
	})

	return api;
}
