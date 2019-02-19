import * as redis from 'redis';
import config from '../config';

export default config.redis ? redis.createClient(
	config.redis.url
) : null;
