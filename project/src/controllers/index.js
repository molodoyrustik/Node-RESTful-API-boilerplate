import Auth from './Auth';
import User from './User';

export default function () {
  return {
    Auth: Auth(...arguments),
    User: User(...arguments),
  }
}
