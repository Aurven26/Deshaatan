import {APIError, type CollectionBeforeOperationHook} from 'payload';

export const passwordPolicy: CollectionBeforeOperationHook = ({args, operation}) => {
  if (!['create', 'update', 'resetPassword'].includes(operation) || !('data' in args) || !args.data || typeof args.data !== 'object') return args;
  const data = args.data as Record<string, unknown>;
  // Payload's edit form may omit or leave a password empty when it is unchanged.
  if (data.password === undefined || operation === 'update' && data.password === '') return args;
  if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128) throw new APIError('Use a password between 8 and 128 characters.', 400);
  return args;
};
